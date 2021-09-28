import { IsNotEmpty, IsOptional, IsNumber, IsString } from 'class-validator';

export class AddFundCreditDto {
  @IsNotEmpty()
  @IsString()
  agent: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  remark: string;
}
