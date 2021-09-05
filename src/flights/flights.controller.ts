import {
  Controller,
  Get,
  Param,
  UseGuards,
  Post,
  Body,
  Req,
} from '@nestjs/common';
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
  findAll(@Req() request, @Body() searchFlights: SearchFlights) {
    return this.flightsService.findAll(request.user.userId, searchFlights);
  }

  @Get('hotdeals/:source')
  flightHotDeals(@Param('source') source: string) {
    return this.flightsService.getHotDeals(+source);
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
