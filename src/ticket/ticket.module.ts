import { Module } from '@nestjs/common';
import { TicketController } from './ticket.controller';
import { TicketService } from './ticket.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TicketSchema } from 'src/Schema/ticket.schema';
import { LogSchema } from 'src/Schema/ticketlogs.schema';
import { CommentSchema } from 'src/Schema/comment.schema';

@Module({
  imports: [MongooseModule.forFeature([{name: 'Tickets',schema:TicketSchema}]),
    MongooseModule.forFeature([{ name: 'comments', schema:CommentSchema }]),
    MongooseModule.forFeature([{ name: 'TicketLogs', schema:LogSchema }]), 
  ],
  controllers: [TicketController],
  providers: [TicketService],
})
export class TicketModule {}