import { IsNotEmpty } from 'class-validator';

export class UserMarkupsDto {
  @IsNotEmpty()
  readonly agentId: string;
  @IsNotEmpty()
  readonly markupId: string;
}
