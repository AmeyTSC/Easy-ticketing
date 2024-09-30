import { SchemaFactory, Prop, Schema } from '@nestjs/mongoose';
import { User } from './user.schema';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema()
export class Tickets extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  priority: string;

  @Prop({default:'open'})
  status:string

  @Prop({ required: true })
  category: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  createdBy: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  assignedAgent: User;

}

export const TicketSchema = SchemaFactory.createForClass(Tickets);
