import { PartialType } from '@nestjs/swagger';
import {
  IsAlphanumeric,
  IsBoolean,
  IsDateString,
  IsNumber,
  IsNumberString,
  IsOptional,
} from 'class-validator';
import { CreateTicketDto } from './create-ticket.dto';

export class UpdateTicketDto extends PartialType(CreateTicketDto) {
  @IsOptional()
  @IsDateString()
  departureDateTime: string;

  @IsOptional()
  @IsDateString()
  arrivalDateTime: string;

  @IsOptional()
  @IsNumber()
  source: number;

  @IsOptional()
  @IsNumber()
  destination: number;

  @IsOptional()
  @IsNumber()
  airline: number;

  @IsOptional()
  @IsAlphanumeric()
  flightNumber: string;

  @IsOptional()
  @IsNumber()
  price: number;

  @IsOptional()
  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsBoolean()
  isRefundable: boolean;

  @IsOptional()
  @IsBoolean()
  isHotDeal: boolean;

  @IsOptional()
  note: string;
}
