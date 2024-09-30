import { Module } from '@nestjs/common';
import { TicketController } from './ticket.controller';
import { TicketService } from './ticket.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TicketSchema, Tickets } from 'src/Schema/ticket.schema';
import { User,UserSchema } from 'src/Schema/user.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    MongooseModule.forFeature([{ name: 'Tickets', schema: TicketSchema }]), 
  ],
  controllers: [TicketController],
  providers: [TicketService],
})
export class TicketModule {}