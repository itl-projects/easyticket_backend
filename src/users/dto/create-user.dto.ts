import {
  IsAlpha,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
} from 'class-validator';
import { UniqueOnDatabase } from 'src/commons/UniqueValidation';
import { UserProfile } from '../entities/profile.entity';
import { User } from '../entities/user.entity';

export class CreateUserDto {
  @IsNotEmpty()
  readonly firstName: string;

  @IsNotEmpty()
  readonly lastName: string;

  @IsEmail()
  @UniqueOnDatabase(User)
  readonly email: string;

  @IsNotEmpty()
  @IsPhoneNumber('IN')
  @UniqueOnDatabase(User)
  readonly phone: string;

  // readonly password: string;

  @IsNotEmpty()
  readonly role: number;

  @IsNotEmpty()
  readonly city: string;

  @IsNotEmpty()
  readonly state: string;

  @IsOptional()
  readonly pan: string;

  @IsNotEmpty()
  @UniqueOnDatabase(UserProfile)
  readonly company: string;

  @IsOptional()
  readonly commision: number;
}
