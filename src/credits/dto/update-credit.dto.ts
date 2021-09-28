import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateCreditDto {
  @IsNotEmpty()
  @IsString()
  status: string;
}
