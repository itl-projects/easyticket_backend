import { Injectable } from '@nestjs/common';
import { paginate } from 'nestjs-typeorm-paginate';
import { MarkUp } from 'src/settings/entities/markup.entity';
import { Ticket } from 'src/tickets/entities/ticket.entity';
import { User } from 'src/users/entities/user.entity';
import { IsNull } from 'typeorm';
import { Between, In, Like, Not } from 'typeorm';
import { CreateBookingDto } from './dto/create-booking.dto';
import { FindBookingDto } from './dto/find-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { Booking } from './entities/booking.entity';
import { Passenger } from './entities/passenger.entity';

@Injectable()
export class BookingsService {
  async create(createBookingDto: CreateBookingDto, userId: string) {
    const ticketRes = await Ticket.findOne(createBookingDto.ticket);
    let booking = null;
    let passengers = null;
    try {
      if (!ticketRes) {
        return {
          status: false,
          message: 'Ticket not found',
          data: null,
        };
      }
      if (ticketRes.quantity < createBookingDto.quantity) {
        return {
          status: false,
          message: `Booking failed! \nOnly ${ticketRes.quantity} tickets are available`,
          data: null,
        };
      }
      ticketRes.quantity = ticketRes.quantity - createBookingDto.quantity;
      let amount =
        createBookingDto.quantity * ticketRes.price + createBookingDto.markup;
      const user = await User.findOne(userId, {
        loadRelationIds: true,
      });

      if (user.markup) {
        const markup = await MarkUp.findOne(user.markup);
        const markupPrice =
          markup.type === 'pnr'
            ? markup.price
            : ticketRes.quantity * markup.price;
        amount += markupPrice;
      }
      if (user.commision < amount) {
        return {
          status: false,
          message: `Booking failed! insufficient account balance`,
          data: null,
        };
      }
      booking = Booking.create({
        ticket: ticketRes,
        amount,
        passengerCount: createBookingDto.quantity,
        user: user,
      });

      await booking.save();
      if (!booking) {
        return {
          status: false,
          message: `Failed to book ticket.\n Please try again.`,
          data: null,
        };
      }
      await ticketRes.save();
      const passengersArr = createBookingDto.passengers.map((item) => ({
        ...item,
        booking,
      }));
      passengers = await Passenger.createQueryBuilder()
        .insert()
        .values(passengersArr)
        .execute();

      if (
        passengers.identifiers.length === createBookingDto.passengers.length
      ) {
        user.commision -= amount;
        await user.save();
        const data = await Booking.findOne(booking.id, {
          relations: ['passengers', 'ticket'],
        });

        return {
          status: true,
          message: `Ticket booked successfully.`,
          data,
        };
      } else {
        ticketRes.quantity = ticketRes.quantity + createBookingDto.quantity;
        passengers.identifiers.map(
          async (item) => await (await Passenger.findOne(item.id)).remove(),
        );
        await ticketRes.save();
        await booking.remove();
        return {
          status: false,
          message: `Failed to book ticket.\n Please try again.`,
          data: null,
        };
      }
    } catch (err) {
      ticketRes.quantity = ticketRes.quantity + createBookingDto.quantity;
      passengers &&
        passengers.identifiers.map(
          async (item) => await (await Passenger.findOne(item.id)).remove(),
        );
      await ticketRes.save();
      booking && (await booking.remove());
      return {
        status: false,
        message: `Failed to book ticket.\n Please try again.`,
        data: null,
      };
    }
  }

  async findAll(userId: string, page: string, limit: string, keyword: string) {
    const _keyword = keyword || '';
    const _page = page ? parseInt(page) : 1;
    const _limit = limit ? parseInt(limit) : 10;
    const results = await paginate(
      Booking.getRepository(),
      { page: _page, limit: _limit },
      {
        where: {
          user: { id: Like(userId) },
          ticket: Not(IsNull()),
        },
        relations: ['passengers', 'ticket'],
      },
    );
    return {
      status: true,
      message: 'Booking fetched successfully',
      data: results,
      meta: results.meta,
    };
  }

  async findAllUserBookings(userId: string, findBookingDto: FindBookingDto) {
    const conditions = {
      user: { id: Like(userId) },
    };
    const _page = findBookingDto.page || 1;
    const _limit = findBookingDto.limit || 10;
    if (findBookingDto.bookingRef) {
      conditions['bookingRef'] = Like(`%${findBookingDto.bookingRef}%`);
    }
    if (findBookingDto.pnr) {
      conditions['pnr'] = Like(`%${findBookingDto.pnr}%`);
    }
    if (findBookingDto.fromDate && findBookingDto.toDate) {
      conditions['creationDate'] = Between(
        findBookingDto.fromDate,
        findBookingDto.toDate,
      );
    } else if (findBookingDto.fromDate) {
      const fd = new Date(findBookingDto.fromDate);
      conditions['creationDate'] = Between(
        new Date(fd.getTime() - 24 * 60 * 60 * 1000).toJSON(),
        new Date(fd.getTime()).toJSON(),
      );
    } else if (findBookingDto.toDate) {
      const fd = new Date(findBookingDto.toDate);
      conditions['creationDate'] = Between(
        new Date(fd.getTime() - 24 * 60 * 60 * 1000).toJSON(),
        new Date(fd.getTime()).toJSON(),
      );
    }
    if (findBookingDto.travelDate) {
      const fd = new Date(findBookingDto.travelDate);

      const ts = await Ticket.find({
        where: {
          departureDateTime: Between(
            new Date(fd.getTime() - 24 * 60 * 60 * 1000).toJSON(),
            new Date(fd.getTime() + 24 * 60 * 60 * 1000).toJSON(),
          ),
        },
      });

      conditions['ticket'] = In(ts.map((el) => el.id));
    }
    const results = await paginate(
      Booking.getRepository(),
      { page: _page, limit: _limit },
      {
        join: {
          alias: 'booking',
          leftJoinAndSelect: {
            ticket: 'booking.ticket',
          },
        },
        where: {
          ...conditions,
          ticket: Not(IsNull()),
        },
        relations: ['passengers', 'ticket'],
      },
    );
    return {
      status: true,
      message: 'Booking fetched successfully',
      data: results,
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} booking`;
  }

  update(id: number, updateBookingDto: UpdateBookingDto) {
    return `This action updates a #${id} booking`;
  }

  async updatePNR(
    userId: string,
    id: string,
    updateBookingDto: UpdateBookingDto,
  ) {
    try {
      const ticket = await Ticket.find({
        where: {
          id: updateBookingDto.ticket,
          user: {
            id: userId,
          },
        },
      });
      if (ticket) {
        const booking = await Booking.findOne(id);
        if (booking) {
          booking.pnr = updateBookingDto.pnr;
          await booking.save();
          return {
            status: true,
            message: 'PNR updated successfully',
          };
        }
        return {
          status: false,
          message: 'Failed to update PNR',
        };
      }
      return {
        status: false,
        message: 'Failed to update PNR',
      };
    } catch (err) {
      return {
        status: false,
        message: 'Failed to update PNR',
      };
    }
    return `This action updates a #${id} booking`;
  }

  remove(id: number) {
    return `This action removes a #${id} booking`;
  }

  async findAllPendings(
    userId: string,
    page: string,
    limit: string,
    keyword: string,
  ) {
    const _keyword = keyword || '';
    const _page = page ? parseInt(page) : 1;
    const _limit = limit ? parseInt(limit) : 10;

    // const results = await Booking.createQueryBuilder('booking')
    //   .leftJoinAndSelect('booking.ticket', 'ticket')
    //   .andWhere('ticket.user.id = :userId', { userId })
    //   .execute();

    const results = await paginate(
      Booking.getRepository(),
      { page: _page, limit: _limit },
      {
        join: {
          alias: 'booking',
          leftJoinAndSelect: {
            ticket: 'booking.ticket',
          },
        },
        where: { pnr: '', ticket: Not(IsNull()) },
        order: { creationDate: 'DESC' },
        relations: ['user', 'passengers', 'ticket'],
      },
    );

    const data = results.items.map((item) => {
      if (item.user) delete item.user.password;
      return item;
    });

    return {
      status: true,
      message: 'Booking fetched successfully',
      data: {
        items: data,
        meta: results.meta,
      },
    };
  }

  async findAllUpdatedBookings(
    userId: string,
    page: string,
    limit: string,
    keyword: string,
  ) {
    const _keyword = keyword || '';
    const _page = page ? parseInt(page) : 1;
    const _limit = limit ? parseInt(limit) : 10;

    // const results = await Booking.createQueryBuilder('booking')
    //   .leftJoinAndSelect('booking.ticket', 'ticket')
    //   .andWhere('ticket.user.id = :userId', { userId })
    //   .execute();

    const results = await paginate(
      Booking.getRepository(),
      { page: _page, limit: _limit },
      {
        // join: {
        //   alias: 'booking',
        //   leftJoinAndSelect: {
        //     ticket: 'booking.ticket',
        //   },
        // },
        where: { pnr: Not(''), ticket: Not(IsNull()) },
        relations: ['user', 'passengers', 'ticket'],
      },
    );

    const data = results.items.map((item) => {
      if (item.user) delete item.user.password;
      return item;
    });

    return {
      status: true,
      message: 'Booking fetched successfully',
      data: {
        items: data,
        meta: results.meta,
      },
    };
  }
}
