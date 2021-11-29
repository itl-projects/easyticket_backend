import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RolesAllowed } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/constants/Roles';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { FindBookingDto } from './dto/find-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@ApiTags('Tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
@RolesAllowed(Roles.USER, Roles.ADMIN, Roles.SUPPLIER)
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post('confirm')
  create(@Req() request, @Body() createBookingDto: CreateBookingDto) {
    return this.bookingsService.create(createBookingDto, request.user.userId);
  }

  @Get()
  findAll(
    @Req() request,
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('keyword') keyword: string,
  ) {
    return this.bookingsService.findAll(
      request.user.userId,
      page,
      limit,
      keyword,
    );
  }

  @Post('getBookings')
  getAllUsersBookings(@Req() request, @Body() findBooking: FindBookingDto) {
    return this.bookingsService.findAllUserBookings(
      request.user.userId,
      findBooking,
    );
  }

  @Get('pendings')
  findAllPendings(
    @Req() request,
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('keyword') keyword: string,
  ) {
    return this.bookingsService.findAllPendings(
      request.user.userId,
      page,
      limit,
      keyword,
    );
  }

  @Get('get-booking-counts')
  getPendingAndUpdatedBookings() {
    return this.bookingsService.getPendingAndUpdatedBookings();
  }

  @Post('updated')
  findAllUpdatedBookings(
    @Req() request,
    @Body() findBookingDto: FindBookingDto,
  ) {
    return this.bookingsService.findAllUpdatedBookings(
      request.user.userId,
      findBookingDto,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Req() request,
    @Param('id') id: string,
    @Body() updateBookingDto: UpdateBookingDto,
  ) {
    return this.bookingsService.updatePNR(
      request.user.userId,
      id,
      updateBookingDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bookingsService.remove(+id);
  }
}
