import { IsEmail, IsNotEmpty, IsPhoneNumber } from 'class-validator';
import { UniqueOnDatabase } from 'src/commons/UniqueValidation';
import { User } from 'src/users/entities/user.entity';
import { UserProfile } from 'src/users/entities/profile.entity';

export class RegisterDto {
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
  readonly phone: number;

  @IsNotEmpty()
  readonly password: string;
  // readonly password: string;

  @IsNotEmpty()
  readonly city: string;

  @IsNotEmpty()
  readonly state: string;

  @IsNotEmpty()
  @UniqueOnDatabase(UserProfile)
  readonly company: string;
}
