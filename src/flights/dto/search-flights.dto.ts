import {
  IsNotEmpty,
  IsNumber,
  IsDateString,
  IsNumberString,
  IsOptional,
} from 'class-validator';

export class SearchFlights {
  @IsNotEmpty()
  @IsDateString()
  departureDateTime: string;

  @IsNotEmpty()
  @IsNumber()
  source: number;

  @IsNotEmpty()
  @IsNumber()
  destination: number;

  @IsOptional()
  @IsNumberString()
  quantity: number;
}
