import { Controller, Get, Param, UseGuards, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RolesAllowed } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/constants/Roles';
import { SearchFlights } from './dto/search-flights.dto';
import { FlightsService } from './flights.service';

@ApiTags('Flights')
@UseGuards(JwtAuthGuard, RolesGuard)
@RolesAllowed(Roles.USER)
@Controller('flights')
export class FlightsController {
  constructor(private flightsService: FlightsService) {}

  @Post()
  findAll(@Body() searchFlights: SearchFlights) {
    return this.flightsService.findAll(searchFlights);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.flightsService.findOne(id);
  }

  @Get('airline/:id')
  findFlightNumbersByAirline(@Param('id') id: string) {
    return this.flightsService.findByAirline(id);
  }
}
