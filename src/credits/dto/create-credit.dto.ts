import { IsNotEmpty, IsOptional, IsNumber, IsString } from 'class-validator';

export class CreateCreditDto {
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  remark: string;
}
