import { Types } from 'mongoose';
import { User } from './user.interface';
export interface TicketLog {
  _id?: Types.ObjectId;
  userId: Types.ObjectId | User;
  updateFields: object;
  updateType: string;
}