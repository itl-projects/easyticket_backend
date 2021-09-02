import { Injectable } from '@nestjs/common';
import { paginate } from 'nestjs-typeorm-paginate';
import { identity } from 'rxjs';
import { Booking } from 'src/bookings/entities/booking.entity';
import { User } from 'src/users/entities/user.entity';
import { Equal } from 'typeorm';
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

  async findAll(userId: string, page: string, limit: string, keyword: string) {
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
          'note',
        ],
        where: {
          user: Equal(userId),
        },
        order: {
          creationDate: 'DESC',
        },
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

  async update(id: string, updateTicketDto: UpdateTicketDto) {
    const ticket = await Ticket.createQueryBuilder()
      .update()
      .set(updateTicketDto)
      .where('id = :ticketId', { ticketId: id })
      .execute();
    if (ticket) {
      return {
        success: true,
        message: 'Success! Ticket updated Successfully',
      };
    }
    return {
      success: false,
      message: 'Sorry! Failed to update ticket',
    };
  }

  async remove(id: string) {
    const ticket = await (await Ticket.findOne(id)).remove();

    if (ticket) {
      return {
        success: true,
        message: 'Ticket removed successfully',
        data: ticket,
      };
    }
    return {
      success: false,
      message: 'Failed to remove ticket',
      data: null,
    };
  }
}
