import { Injectable } from '@nestjs/common';
import { Between, Equal, MoreThanOrEqual } from 'typeorm';
import { Ticket } from '../tickets/entities/ticket.entity';
import { SearchFlights } from './dto/search-flights.dto';

@Injectable()
export class FlightsService {
  async findAll(searchFlights: SearchFlights) {
    let searchDate = searchFlights.departureDateTime.split('T')[0];
    const today = new Date().toISOString();
    if (today.split('T')[0] === searchDate) {
      searchDate = new Date(
        new Date().getTime() - 15 * 60 * 60 * 1000,
      ).toJSON();
    }
    const data = await Ticket.createQueryBuilder()
      .where({
        source: searchFlights.source,
        departureDateTime: Between(
          searchDate,
          new Date(
            new Date(searchDate).getTime() + 24 * 60 * 60 * 1000,
          ).toISOString(),
        ),
        quantity: MoreThanOrEqual(searchFlights.quantity || 1),
        destination: Equal(searchFlights.destination),
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

  async getHotDeals(source: number) {
    try {
      const searchDate = new Date(
        new Date().getTime() + 15 * 60 * 60 * 1000,
      ).toJSON();
      const data = await Ticket.createQueryBuilder()
        .select([
          'DISTINCT (Ticket.destination) AS destination',
          'departureDateTime',
          'source',
        ])
        .where({
          source: source,
          quantity: MoreThanOrEqual(1),
          departureDateTime: MoreThanOrEqual(searchDate),
        })
        .orderBy('departureDateTime')
        .getRawMany();

      if (data) {
        const destinations = [];
        const result = data.filter((newVal) => {
          if (destinations.indexOf(newVal.destination) === -1) {
            destinations.push(newVal.destination);
            return newVal;
          }
        });

        return {
          status: true,
          message: 'Hot Deal found',
          data: result,
        };
      }

      return {
        status: true,
        message: 'Hot Deal found',
        data: data,
      };
    } catch (err) {
      console.log(err);
      return {
        status: false,
        message: 'No Deal found',
        data: null,
      };
    }
  }
}
