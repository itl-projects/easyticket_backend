import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  IsString,
} from 'class-validator';
import { Passenger } from './passenger.model';

export class CreateBookingDto {
  @IsNotEmpty()
  @IsString()
  ticket: string;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsNotEmpty()
  @IsNumber()
  markup: number;

  @IsArray()
  @ValidateNested({ each: true, message: 'please fill all passenger details' })
  @ArrayMinSize(1)
  @Type(() => Passenger)
  passengers: Passenger[];
}
