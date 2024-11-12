import { Types } from 'mongoose';
import { User } from './user.interface';
import { TicketLog } from './ticketLog.interface';
import { Comment } from './comments.interface';

export interface Ticket {
  _id?: Types.ObjectId;
  title: string;
  description: string;
  status?: string;
  priority: string;
  createdBy: Types.ObjectId | User;
  category: string;
  assignedAgent: Types.ObjectId | User;
  comments: Types.ObjectId[] ;
  history: Types.ObjectId[] ;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateTicket {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  category?: string;
}
