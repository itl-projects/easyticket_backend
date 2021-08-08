import { Injectable } from '@nestjs/common';
import { paginate } from 'nestjs-typeorm-paginate';
import { User } from 'src/users/entities/user.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { Ticket } from './entities/ticket.entity';

@Injectable()
export class TicketsService {
  async create(createTicketDto: CreateTicketDto, userId: string) {
    try {
      if (createTicketDto.source === createTicketDto.destination) {
        return {
          status: false,
          message: 'Source and destination should not be same',
          data: null,
        };
      }
      if (
        new Date(createTicketDto.arrivalDateTime) <=
        new Date(createTicketDto.departureDateTime)
      ) {
        return {
          status: false,
          message: 'Incorrect departure and arrival datetime',
          data: null,
        };
      }
      const user = await User.findOne(userId);
      const ticket = Ticket.create({ ...createTicketDto, user });
      await ticket.save();
      if (ticket) {
        delete ticket.user.password;
        return {
          status: true,
          message: 'Ticket created successfully',
          data: ticket,
        };
      } else
        return {
          status: false,
          message: 'Failed to create Ticket',
          data: null,
        };
    } catch (err) {
      console.log(err);
      return {
        status: false,
        message: 'Internal server error',
        data: null,
      };
    }
  }

  async findAll(page: string, limit: string, keyword: string) {
    const _keyword = keyword || '';
    const _page = page ? parseInt(page) : 1;
    const _limit = limit ? parseInt(limit) : 10;
    const results = await paginate(
      Ticket.getRepository(),
      { page: _page, limit: _limit },
      {
        select: [
          'id',
          'airline',
          'arrivalDateTime',
          'departureDateTime',
          'source',
          'destination',
          'flightNumber',
          'isHotDeal',
          'isRefundable',
          'price',
          'quantity',
          'user',
          'creationDate',
        ],
        relations: ['user'],
      },
    );
    const data = results.items.map((item) => {
      if (item.user) delete item.user.password;
      return item;
    });
    return {
      status: true,
      message: 'Tickets fetched successfully',
      data: data,
      meta: results.meta,
    };
  }

  async findOne(id: string) {
    const ticket = await Ticket.findOne(id);
    if (ticket) {
      return {
        status: true,
        message: 'Ticket found',
        data: ticket,
      };
    }
    return {
      status: false,
      message: 'Invalid ID',
      data: null,
    };
  }

  update(id: number, updateTicketDto: UpdateTicketDto) {
    return `This action updates a #${id} ticket`;
  }

  remove(id: number) {
    return `This action removes a #${id} ticket`;
  }
}
