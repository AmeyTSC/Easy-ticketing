import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  HttpException,
  UseGuards
} from '@nestjs/common';
import { Response } from 'express';
import { TicketService } from './ticket.service';
import { sendMail } from 'src/utils/notification'; 
import { AuthGuard } from 'src/Guards/auth.guards';
import { Ticket, UpdateTicket } from 'src/Interface/tickets.interface';
import { RequestWithUser, RequestQuery } from 'src/Interface/auth.interface';
@Controller('tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Get()
  @UseGuards(new AuthGuard(['admin', 'support', 'user'])) 
  async getTickets(req: RequestWithUser, res: Response) {
    try {
      const { status, priority, category, assigned, sortBy, sortOrder } =
        req.query as RequestQuery;
      const tickets = await this.ticketService.findAllTickets(
        req.user,
        status,
        priority,
        category,
        assigned,
        sortBy,
        sortOrder,
      );
      res.status(200).json({ data: tickets, message: 'tickets' });
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  @Post()
  @UseGuards(new AuthGuard(['user']))
  async createTicket(req: RequestWithUser, res: Response) {
    try {
      const ticketData = req.body;
      ticketData.createdBy = req.user._id;
      const ticket = await this.ticketService.newTicket(ticketData);
      await sendMail(
        req.user.email,
        'Ticket Creation',
        `<h3>New Ticket Created!<h3>`,
      );
      res.status(201).json({ data: ticket, message: 'Ticket creation successful' });
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  @Get('/:id')
  @UseGuards(new AuthGuard(['user']))
  async getTicketById(req: RequestWithUser, res: Response) {
    try {
      const ticketId = req.params.id;
      const ticket = await this.ticketService.getTicketById(ticketId, req.user);
      res.status(200).json({ data: ticket, message: 'Ticket retrieved successfully' });
    } catch (error) {
      throw new HttpException(error.message,404);
    }
  }

  @Put('/:id')
  @UseGuards(new AuthGuard(['admin', 'user']))
  async updateTicket(req: RequestWithUser, res: Response) {
    try {
      const ticketId = req.params.id;
      const updateData: UpdateTicket = {
        title: req.body.title,
        description: req.body.description,
        status: req.body.status,
        priority: req.body.priority,
        category: req.body.category,
      };

      const updatedTicket = await this.ticketService.updateTicketById(
        ticketId,
        updateData,
        req.user,
      );
      await sendMail(
        req.user.email,
        'Ticket Updation',
        `<h3>Ticket Updated Successfully!<h3>`,
      );

      res
        .status(201)
        .json({ data: updatedTicket, message: 'Ticket update successfull' });
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  @Put('/claim/:id')
  @UseGuards(new AuthGuard(['admin', 'support'])) 
  async claimTicket(req: RequestWithUser, res: Response) {
    try {
      const ticketId = req.params.id;
      const ticket = await this.ticketService.assignTicket(ticketId, req.user);
      await sendMail(
        req.user.email,
        'Ticket Claimed',
        `<h5>Successfully Claimed Ticket with Id: <p>${ticket._id}</p>!<h5>`,
      );

      if (
        ticket.createdBy &&
        typeof ticket.createdBy == 'object' &&
        'email' in ticket.createdBy
      ) {
        await sendMail(
          ticket.createdBy.email,
          'Ticket Assigned',
          `<h5>Ticket with, Id: <p> ${ticket._id}</p> assigned to Agent with email ${req.user.email}<h5>`,
        );
      }

      if (ticket)
        res.status(201).json({ data: ticket, message: 'Ticket claim successfull' });
      else
        res.status(409).json({ data: ticket, message: 'Ticket already claimed' });
    } catch (error) {
      throw new HttpException(error.message, 409);
    }
  }

  @Get('/claimed')
  @UseGuards(new AuthGuard(['admin', 'support']))
  async getClaimedTickets(req: RequestWithUser, res: Response) {
    try {
      const tickets = await this.ticketService.findTickets(req.user);
      res.status(200).json({ data: tickets, message: 'Claimed tickets' });
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  @Put('/reassign/:id')
  @UseGuards(new AuthGuard(['admin', 'support']))
  async reassignTicket(req: RequestWithUser, res: Response) {
    try {
      const ticketId = req.params.id;
      const newAgentId = req.body.agentId;

      const ticket = await this.ticketService.changeAgent(
        ticketId,
        newAgentId,
        req.user,
      );
      await sendMail(
        req.user.email,
        'Ticket Reassigned Successfully',
        `<h5>Successfully Reassigned Ticket with Id: <p>${ticket._id}</p><h5>`,
      );

      //email for new agent
      if (
        ticket.assignedAgent &&
        typeof ticket.assignedAgent == 'object' &&
        'email' in ticket.assignedAgent
      ) {
        await sendMail(
          ticket.assignedAgent.email,
          'Ticket Assigned',
          `<h5>Ticket with, Id: <p> ${ticket._id}</p>Assigned to you by the Agent with email ${req.user.email}<h5>`,
        );
      }

      //email for user
      if (
        ticket.createdBy &&
        typeof ticket.createdBy == 'object' &&
        'email' in ticket.createdBy
      ) {
        await sendMail(
          ticket.createdBy.email,
          'New Agent Assigned',
          `<h5>Ticket Assigned to a new Agent<h5>`,
        );
      }

      res.status(201).json({ data: ticket, message: 'Ticket reassign successfull' });
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  @Put('/resolve/:id')
  @UseGuards(new AuthGuard(['admin', 'support']))
  async resolveTicket(req: RequestWithUser, res: Response) {
    try {
      const ticketId = req.params.id;

      const ticket: Ticket = await this.ticketService.closeTicket(
        ticketId,
        req.user,
      );
      //email for support agent
      await sendMail(
        req.user.email,
        'Ticket Closed',
        `<h5>Successfully Closed Ticket with Id: <p>${ticket._id}</p>!<h5>`,
      );

      if (
        ticket.createdBy &&
        typeof ticket.createdBy == 'object' &&
        'email' in ticket.createdBy
      ) {
        await sendMail(
          ticket.createdBy.email,
          'Ticket Closed',
          `<h5>Ticket with, Id: <p> ${ticket._id}</p> Closed by the Agent with email ${req.user.email}<h5>`,
        );
      }
      res.status(201).json({ message: 'Ticket resolved', data: ticket });
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  @Post('/comments/:id')
  @UseGuards(new AuthGuard(['admin', 'support', 'user']))
  async addComment(req: RequestWithUser, res: Response) {
    try {
      const ticketId = req.params.id;
      const comment = req.body.text;
      const ticket = await this.ticketService.createComment(
        ticketId,
        comment,
        req.user,
      );

      //email for user/owner of ticket
      if (
        ticket.createdBy &&
        typeof ticket.createdBy == 'object' &&
        'email' in ticket.createdBy
      ) {
        await sendMail(
          ticket.createdBy.email,
          'New Comment Added',
          `<h5>New Comment Added on the Ticket with Id: <p>${ticket._id}</p><h5>`,
        );
      }
      //email for support agent
      if (
        ticket.assignedAgent &&
        typeof ticket.assignedAgent == 'object' &&
        'email' in ticket.assignedAgent
      ) {
        await sendMail(
          ticket.assignedAgent.email,
          'New Comment Added',
          `<h5>New Comment Added on the Ticket with Id: <p>${ticket._id}</p> <h5>`,
        );
      }
      res.status(201).json({ data: ticket, message: 'Ticket comment added' });
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  @Get('/comments/:id')
  @UseGuards(new AuthGuard(['admin', 'support', 'user']))
  async getCommentsById(req: RequestWithUser, res: Response) {
    try {
      const ticketId = req.params.id;
      const comments = await this.ticketService.getComments(ticketId, req.user);
      res.status(200).json({ data: comments, message: 'Ticket comments' });
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  @Delete('/:id')
  @UseGuards(new AuthGuard(['admin', 'support']))
  async deleteTicket(req: RequestWithUser, res: Response) {
    try {
      const ticketId = req.params.id;
      const ticket = await this.ticketService.findAndDeleteTicket(
        ticketId,
        req.user,
      );

      //email for user/owner of ticket
      //agent and admin can delete the ticket
      if (
        ticket.createdBy &&
        typeof ticket.createdBy == 'object' &&
        'email' in ticket.createdBy
      ) {
        await sendMail(
          ticket.createdBy.email,
          'Ticket Deleted',
          `<h5>Ticket with Id: <p>${ticket._id}</p> Deleted by the admin/agent with email ${req.user.email} <h5>`,
        );
      }

      //email for support agent
      await sendMail(
        req.user.email,
        'Ticket Deleted',
        `<h5> Ticket with Id: <p>${ticket._id}</p> Deleted <h5>`,
      );

      res.status(200).json({ data: ticket, message: 'Ticket deleted' });
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  @Get('/history/:id')
  @UseGuards(new AuthGuard(['admin', 'support', 'user']))
  async getTicketLogs(req: RequestWithUser, res: Response) {
    try {
      const ticketId = req.params.id;
      const history = await this.ticketService.getLogs(ticketId, req.user);
      res.status(200).json({ data: history, message: 'Ticket history' });
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }
}
