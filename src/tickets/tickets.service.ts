import { Injectable } from '@nestjs/common';
import { paginate } from 'nestjs-typeorm-paginate';
import { User } from 'src/users/entities/user.entity';
import { Between, Equal, In, MoreThanOrEqual } from 'typeorm';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { FilterTicket } from './dto/filter-ticket.dto';
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
      return {
        status: false,
        message: 'Internal server error',
        data: null,
      };
    }
  }

  async createBulk(createTicketDto: CreateTicketDto[], userId: string) {
    try {
      for (let i = 0; i < createTicketDto.length; i++) {
        if (createTicketDto[i].source === createTicketDto[i].destination) {
          return {
            status: false,
            message: 'Source and destination should not be same',
            data: null,
          };
        }
        if (
          new Date(createTicketDto[i].arrivalDateTime) <=
          new Date(createTicketDto[i].departureDateTime)
        ) {
          return {
            status: false,
            message: 'Incorrect departure and arrival datetime',
            data: null,
          };
        }
      }

      const user = await User.findOne(userId);
      const values = createTicketDto.map((el) => ({
        ...el,
        user: user,
      }));
      const ticket = await Ticket.createQueryBuilder()
        .insert()
        .into(Ticket)
        .values(values)
        .execute();
      if (ticket) {
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
          departureDateTime: 'ASC',
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

  async filterTickets(userId: string, filterTicket: FilterTicket) {
    const _page = filterTicket.page ? filterTicket.page : 1;
    const _limit = filterTicket.limit ? filterTicket.limit : 10;
    const conditions = { user: Equal(userId) };
    if (filterTicket.airline) {
      conditions['airline'] = filterTicket.airline;
    }
    if (filterTicket.departureDate) {
      conditions['departureDateTime'] = Between(
        new Date(`${filterTicket.departureDate.split('T')[0]} 00:00`),
        new Date(`${new Date().toISOString().split('T')[0]} 23:59`),
      );
    } else {
      conditions['arrivalDateTime'] = MoreThanOrEqual(
        new Date(`${new Date().toISOString().split('T')[0]} 00:00`),
      );
    }
    if (filterTicket.arrivalDate) {
      conditions['arrivalDateTime'] = Between(
        new Date(`${new Date().toISOString().split('T')[0]} 00:00`),
        new Date(`${filterTicket.arrivalDate.split('T')[0]} 23:59`),
      );
    }

    if (filterTicket.source) {
      conditions['source'] = filterTicket.source;
    }
    if (filterTicket.destination) {
      conditions['destination'] = filterTicket.destination;
    }

    if (filterTicket.uploadedBy) {
      const users = User.find({
        select: ['id'],
        where: { role: filterTicket.uploadedBy },
      });
      conditions['user'] = In((await users).map((el) => el.id));
    }

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
        where: conditions,
        order: {
          departureDateTime: 'ASC',
        },
        relations: ['user'],
      },
    );
    const data = results.items.map((item) => {
      if (item.user) delete item.user.password;
      return item;
    });
    return {
      success: true,
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
