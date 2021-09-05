import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateMarkupDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsNotEmpty()
  @IsString()
  type: string;
}
