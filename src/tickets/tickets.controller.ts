import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { ApiTags } from '@nestjs/swagger';
import { RolesAllowed } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/constants/Roles';
import { FilterTicket } from './dto/filter-ticket.dto';

@ApiTags('Tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
@RolesAllowed(Roles.ADMIN, Roles.SUPPLIER)
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  create(@Req() request, @Body() createTicketDto: CreateTicketDto) {
    return this.ticketsService.create(createTicketDto, request.user.userId);
  }

  @Post('create-bulk')
  createBulk(@Req() request, @Body() createTicketDto: CreateTicketDto[]) {
    return this.ticketsService.createBulk(createTicketDto, request.user.userId);
  }

  @Post('list-tickets')
  findAll(@Req() request, @Body() filterTicket: FilterTicket) {
    return this.ticketsService.filterTickets(request.user.userId, filterTicket);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTicketDto: UpdateTicketDto) {
    return this.ticketsService.update(id, updateTicketDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ticketsService.remove(id);
  }
}
