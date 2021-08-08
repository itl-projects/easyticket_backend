import { Injectable } from '@nestjs/common';
import { Ticket } from '../tickets/entities/ticket.entity';
import { SearchFlights } from './dto/search-flights.dto';

@Injectable()
export class FlightsService {
  async findAll(searchFlights: SearchFlights) {
    const data = await Ticket.createQueryBuilder()

      .where('source = :source', { source: searchFlights.source })
      .andWhere('destination = :destination', {
        destination: searchFlights.destination,
      })
      .andWhere('departureDateTime > :departure', {
        departure: searchFlights.departureDateTime,
      })
      .andWhere('quantity >= :quantity', {
        quantity: searchFlights.quantity || 1,
      })
      .getMany();
    if (data.length) {
      return {
        status: true,
        message: 'Flight found',
        data: data,
      };
    }
    return {
      status: false,
      message: 'Flight not found',
      data: null,
    };
  }

  async findOne(id: string) {
    const flight = await Ticket.findOne(id);
    if (flight) {
      return {
        status: true,
        message: 'Flight found',
        data: flight,
      };
    }
    return {
      status: false,
      message: 'Invalid ID',
      data: null,
    };
  }

  async findByAirline(airlineId: string) {
    const flight = await Ticket.getRepository()
      .createQueryBuilder('ticket')
      .select('ticket.flightNumber')
      .where('airline = :airlineId', { airlineId })
      .getMany();

    if (flight.length > 0) {
      return {
        status: true,
        message: 'Flight numbers found',
        data: flight,
      };
    }
    return {
      status: false,
      message: 'Invalid ID',
      data: null,
    };
  }
}
