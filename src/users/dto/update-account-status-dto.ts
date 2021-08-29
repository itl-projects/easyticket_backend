import { IsNotEmpty } from 'class-validator';

export class UpdateAccountStatusDto {
  @IsNotEmpty()
  readonly status: boolean;
}
