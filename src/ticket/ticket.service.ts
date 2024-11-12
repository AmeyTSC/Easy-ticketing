import { Model} from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/Interface/user.interface';
import { Comment } from 'src/Interface/comments.interface';
import { TicketLog } from 'src/Interface/ticketlog.interface';
import { HttpException, Injectable } from '@nestjs/common';
import { Ticket, UpdateTicket } from 'src/Interface/tickets.interface';

@Injectable()
export class TicketService {
  constructor(
    @InjectModel('Ticket') private readonly TicketModel: Model<Ticket>,
    @InjectModel('Comment') private readonly CommentModel: Model<Comment>,
    @InjectModel('TicketLog') private readonly TicketLogModel: Model<TicketLog>,
  ) {}

  async findAllTickets(
    user: User,
    status: string,
    priority: string,
    category: string,
    assigned: string,
    sortBy: string,
    sortOrder: string,
  ): Promise<Ticket[]> {
    const filter = {};
    const sorter = {};
    let tickets = [];
    if (user.role === 'user') filter['createdBy'] = user._id;

    if (status) filter['status'] = status;

    if (priority) filter['priority'] = priority;

    if (assigned) {
      if (assigned === 'true')
        filter['assignedAgent'] = { $not: { $eq: null } };
      else if (assigned === 'false') filter['assignedAgent'] = null;
    }

    if (category) filter['category'] = category;

    if (sortBy) sorter[sortBy] = sortOrder;
    tickets = await this.TicketModel.find(filter)
      .populate('comments')
      .sort(sorter);
    return tickets;
  }
  async newTicket(ticketData: Ticket): Promise<Ticket> {
    const updateData = {
      userId: ticketData.createdBy,
      updateType: 'newTicket',
      updateFields: ticketData,
    };

    const logData = await this.TicketLogModel.create(updateData);
    if (!logData) {
      throw new HttpException('Failed to create the log',500);
    }
    ticketData['history'] = [logData._id];

    //creating a ticket
    const ticket = await this.TicketModel.create(ticketData);
    if (!ticket) {
      throw new HttpException('Failed to create the ticket',500);
    }
    return ticket;
  }

   async getTicketById(ticketId: string, user: User): Promise<Ticket> {
    const ticket = await this.TicketModel.findById(ticketId).populate('comments');

    if (!ticket) {
      throw new HttpException('Ticket not found',404);
    }

    if (ticket.createdBy.toString() !== user._id.toString() && user.role === 'user') {
      throw new HttpException('Unauthorized Access',403);
    }

    return ticket;
  }

   async updateTicketById(ticketId: string, updateData: UpdateTicket, user: User): Promise<Ticket> {
    const ticket = await this.TicketModel.findById(ticketId);
    if (!ticket) {
      throw new HttpException('Ticket not found',404);
    }
    if (ticket.createdBy.toString() !== user._id.toString() && user.role === 'user') {
      throw new HttpException('Unauthorized Access',403);
    }

    // logging the ticket updation
    const multiFieldUpdateData = {
      userId: user._id,
      updateType: 'updateTicket',
      updateFields: updateData,
    };

    const logData = await this.TicketLogModel.create(multiFieldUpdateData);
    if (!logData) {
      throw new HttpException('Failed to create the log',500);
    }

    const updatedTicket = await this.TicketModel.findByIdAndUpdate(
      ticketId,
      { $set: updateData, $push: { history: logData._id } },
      { new: true },
    ).populate('comments');

    if (!updatedTicket) {
      throw new HttpException('Failed to update ticket',500);
    }
    return updatedTicket;
  }

   async assignTicket(ticketId: string, user: User): Promise<Ticket> {
    const updateData = {
      userId: user._id,
      updateType: 'assignTicket',
      updateFields: {
        assignedAgent: user._id,
        status: 'inProgress',
      },
    };

    const logData = await this.TicketLogModel.create(updateData);
    if (!logData) {
      throw new HttpException('Failed to create the log',500);
    }
    //assigining ticket
    const ticket = await this.TicketModel.findOneAndUpdate(
      { _id: ticketId, assignedAgent: null, status: 'open' },
      { $set: { assignedAgent: user._id, status: 'inProgress' }, $push: { history: logData._id } },
      { new: true },
    ).populate({ path: 'createdBy', select: 'email' });

    if (!ticket) {
      throw new HttpException('Ticket not found/Ticket already assigned',404);
    }

    return ticket;
  }

   async findTickets(user: User): Promise<Ticket[]> {
    const tickets = await this.TicketModel.find({ assignedAgent: user._id });
    if (!tickets) {
      throw new HttpException('Failed to get tickets',500);
    }
    return tickets;
  }

   async changeAgent(ticketId: string, newAgentId: string, user: User): Promise<Ticket> {
    if (user.role == 'support') {
      const ticket = await this.TicketModel.findOne({ _id: ticketId, assignedAgent: user._id });

      if (!ticket) {
        throw new HttpException('Ticket not found or Unauthorized access',404);
      }
    }
    // logging the ticket assigning
    const updateData = {
      userId: user._id,
      updateType: 'reassignTicket',
      updateFields: {
        assignedAgent: newAgentId,
      },
    };

    const logData = await this.TicketLogModel.create(updateData);
    if (!logData) {
      throw new HttpException('Failed to create the log',500);
    }

    //reassigining ticket
    const updatedTicket = await this.TicketModel.findOneAndUpdate(
      { _id: ticketId },
      { $set: { assignedAgent: newAgentId }, $push: { history: logData._id } },
      { new: true },
    ).populate([
      { path: 'createdBy', select: 'email' },
      { path: 'assignedAgent', select: 'email' },
    ]);

    if (!updatedTicket) {
      throw new HttpException(`Ticket with the id ${ticketId} not found`,404);
    }

    return updatedTicket;
  }

   async closeTicket(ticketId: string, user: User): Promise<Ticket> {
    if (user.role == 'support') {
      const ticket = await this.TicketModel.findOne({ _id: ticketId, assignedAgent: user._id });
      if (!ticket) {
        throw new HttpException('Ticket not found or Unauthorized access',404);
      }
    }
    // logging the ticket closing
    const updateData = {
      userId: user._id,
      updateType: 'closeTicket',
      updateFields: {
        status: 'closed',
      },
    };

    const logData = await this.TicketLogModel.create(updateData);
    if (!logData) {
      throw new HttpException('Failed to create the log',500);
    }

    //closing ticket
    const closedTicket = await this.TicketModel.findOneAndUpdate(
      { _id: ticketId },
      { $set: { status: 'closed' }, $push: { history: logData._id } },
      { new: true },
    ).populate([
      { path: 'createdBy', select: 'email' },
      { path: 'assignedAgent', select: 'email' },
    ]);

    if (!closedTicket) {
      throw new HttpException(`Ticket with the id ${ticketId} not found or Unauthorized Agent`,404);
    }

    return closedTicket;
  }

   async createComment(ticketId: string, commentData: string, user: User): Promise<Ticket> {
    // logging the comment creation
    const updateData = {
      userId: user._id,
      updateType: 'comment',
      updateFields: {
        comment: commentData,
      },
    };

    const logData = await this.TicketLogModel.create(updateData);
    if (!logData) {
      throw new HttpException('Failed to create the log',500);
    }

    //creating comment

    const ticket = await this.TicketModel.findById(ticketId);
    if (!ticket) {
      throw new HttpException(`Ticket with the id ${ticketId} not found`,404);
    }

    if (!ticket.assignedAgent) {
      throw new HttpException(`Ticket not yet assigned to an agent`,409);
    }

    if (user.role == 'support' && ticket.assignedAgent.toString() != user._id.toString()) {
      throw new HttpException('Unauthorized Operation',403);
    }

    if (user.role == 'user' && ticket.createdBy.toString() != user._id.toString()) {
      throw new HttpException('Unauthorized Operation',403);
    }

    const comment = await this.CommentModel.create({ text: commentData, author: user._id });

    if (!comment) {
      throw new HttpException('Failed to create the comment',500);
    }

    ticket.comments.push(comment._id);
    ticket.history.push(logData._id);
    await ticket.save();
    const ticketNew = await ticket.populate(['comments', { path: 'createdBy', select: 'email' }, { path: 'assignedAgent', select: 'email' }]);
    if (!ticketNew) {
      throw new HttpException(`Failed to retrieve ticket`,500);
    }
    return ticket;
  }

   async getComments(ticketId: string, user: User): Promise<any> {
    const ticket = await this.TicketModel.findById(ticketId).populate('comments');

    if (!ticket) {
      throw new HttpException(`Ticket with the id ${ticketId} not found`,404);
    }

    if (user.role == 'support' && ticket.assignedAgent.toString() != user._id.toString()) {
      throw new HttpException('Unauthorized Operation',403);
    }

    if (user.role == 'user' && ticket.createdBy.toString() != user._id.toString()) {
      throw new HttpException('Unauthorized Operation',403);
    }

    return ticket.comments;
  }

   async findAndDeleteTicket(ticketId: string, user: User): Promise<Ticket> {
    const ticket = await this.TicketModel.findById(ticketId);

    if (!ticket) {
      throw new HttpException(`Ticket with the id ${ticketId} not found`,404);
    }

    if (user.role == 'support' && ticket.assignedAgent.toString() != user._id.toString()) {
      throw new HttpException('Unauthorized Operation',403);
    }

    await this.CommentModel.deleteMany({ _id: { $in: ticket.comments } });
    await this.TicketLogModel.deleteMany({ _id: { $in: ticket.history } });

    const deletedTicket = await this.TicketModel.findByIdAndDelete(ticketId).populate({ path: 'createdBy', select: 'email' });
    if (!deletedTicket) {
      throw new HttpException(`Failed to delete ticket`,500);
    }
    return deletedTicket;
  }

   async getLogs(ticketId: string, user: User): Promise<any> {
    const ticket = await this.TicketModel.findById(ticketId).populate('history');

    if (!ticket) {
      throw new HttpException(`Ticket with the id ${ticketId} not found`,404);
    }

    if (user.role == 'support' && ticket.assignedAgent.toString() != user._id.toString()) {
      throw new HttpException('Unauthorized Operation',403);
    }

    if (user.role == 'user' && ticket.createdBy.toString() != user._id.toString()) {
      throw new HttpException('Unauthorized Operation',403);
    }

    return ticket.history;
  }
}
