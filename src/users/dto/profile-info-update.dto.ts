import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateProfileInfoDto {
  @IsNotEmpty()
  @IsString()
  readonly firstName: string;

  @IsNotEmpty()
  @IsString()
  readonly lastName: string;

  @IsNotEmpty()
  @IsString()
  readonly company: string;

  readonly address: string;
}
