import { PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { CreateBookingDto } from './create-booking.dto';

export class UpdateBookingDto extends PartialType(CreateBookingDto) {
  @IsNotEmpty()
  @IsString()
  ticket: string;

  @IsNotEmpty()
  @IsString()
  pnr: string;
}
