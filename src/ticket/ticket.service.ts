import { HttpException, HttpStatus, Injectable} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model,Types } from 'mongoose';
import { CreateTicketDto } from 'src/dtos/ticket.dto'; 
import { Tickets } from 'src/Schema/ticket.schema';
import { User } from 'src/Schema/user.schema';

@Injectable()
export class TicketService {
    constructor(@InjectModel('Tickets') private readonly ticketsModel: Model<Tickets>,@InjectModel('User')private readonly userModel:Model<User>) {} 
    async newTicket(createTicketDto: CreateTicketDto): Promise<Tickets> {
        const newTicket = new this.ticketsModel(createTicketDto);
        return await newTicket.save();
    }
    async assignTicket(ticketId: string, agentId: string): Promise<Tickets> {    
        // Check if the agent exists
        const agent = await this.userModel.findById(agentId); 
        if (!agent) {
          throw new HttpException('Agent not found', HttpStatus.NOT_FOUND);
        }
        const ticket = await this.ticketsModel.findOne({ _id: ticketId, status: 'open' });
        if (!ticket) {
          throw new HttpException('Ticket not found or already assigned', HttpStatus.NOT_FOUND);
        }
        ticket.assignedAgent = agent;
        ticket.status = 'inProgress'; 
        const updatedTicket = await ticket.save();
        return updatedTicket;
      }      
}
