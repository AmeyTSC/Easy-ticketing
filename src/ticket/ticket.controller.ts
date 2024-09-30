import { Body, Controller,UseGuards,HttpException, HttpStatus, Param, Post } from '@nestjs/common';
import { CreateTicketDto } from 'src/dtos/ticket.dto';
import { TicketService } from './ticket.service';
import { User } from 'src/Schema/user.schema';
import { JwtAuthGuard } from 'src/auth/Guards/jwt-auth.guard';
import { CurrentUser } from 'src/decorators/current-user.decorators';


@Controller('ticket')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Post('/new')
  async newTicket(@Body() createTicketDto: CreateTicketDto) {
    const response = await this.ticketService.newTicket(createTicketDto);
    return response;
  }

  @UseGuards(JwtAuthGuard) // Protect the route
  @Post(':id/assign')
  async assignTicket(
    @Param('id') ticketId: string, 
    @CurrentUser() user: User, // Extract current user
    @Body('agentId') agentId: string 
  ) {
    if (user.role !== 'admin') {
      throw new HttpException('Forbidden: Only admins can assign tickets', HttpStatus.FORBIDDEN);
    }
    return this.ticketService.assignTicket(ticketId,agentId);
  }
}
