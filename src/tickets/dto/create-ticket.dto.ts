import {
  IsNotEmpty,
  IsNumber,
  IsBoolean,
  IsDateString,
  IsAlphanumeric,
  IsOptional,
} from 'class-validator';

export class CreateTicketDto {
  @IsNotEmpty()
  @IsDateString()
  departureDateTime: string;

  @IsNotEmpty()
  @IsDateString()
  arrivalDateTime: string;

  @IsNotEmpty()
  @IsNumber()
  source: number;

  @IsNotEmpty()
  @IsNumber()
  destination: number;

  @IsNotEmpty()
  @IsNumber()
  airline: number;

  @IsNotEmpty()
  @IsAlphanumeric()
  flightNumber: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsNotEmpty()
  @IsBoolean()
  isRefundable: boolean;

  @IsNotEmpty()
  @IsBoolean()
  isHotDeal: boolean;

  @IsOptional()
  note: string;

  @IsOptional()
  pnr: string;
}
