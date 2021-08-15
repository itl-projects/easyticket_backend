import { Injectable } from '@nestjs/common';
import { paginate } from 'nestjs-typeorm-paginate';
import { Ticket } from 'src/tickets/entities/ticket.entity';
import { User } from 'src/users/entities/user.entity';
import { Equal, Like } from 'typeorm';
import { CreateBookingDto } from './dto/create-booking.dto';
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
      const amount = createBookingDto.quantity * ticketRes.price;
      const user = await User.findOne(userId);
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
      console.log(err);
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
        where: { user: { id: Like(userId) } },
        relations: ['passengers', 'ticket'],
      },
    );
    // const data = results.items.map((item) => {
    //   if (item.user) delete item.user.password;
    //   return item;
    // });
    return {
      status: true,
      message: 'Booking fetched successfully',
      data: results,
      meta: results.meta,
    };
    return `This action returns all bookings`;
  }

  findOne(id: number) {
    return `This action returns a #${id} booking`;
  }

  update(id: number, updateBookingDto: UpdateBookingDto) {
    return `This action updates a #${id} booking`;
  }

  remove(id: number) {
    return `This action removes a #${id} booking`;
  }
}
