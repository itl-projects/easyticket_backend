import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Roles } from 'src/constants/Roles';
import { UserProfile } from 'src/users/entities/profile.entity';

import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { AuthLoginDto } from './dto/auth-login.dto';
import { RegisterDto } from './dto/auth-register.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(authLoginDto: AuthLoginDto) {
    const user = await this.validateUser(authLoginDto);

    if (!user.isActive) {
      return {
        success: false,
        message: 'Your account is disabled. Please contact administrator.',
      };
    }

    const payload = {
      userId: user.id,
    };
    delete user.password;
    return {
      token: this.jwtService.sign(payload),
      success: true,
      user: user,
    };
  }

  async validateUser(authLoginDto: AuthLoginDto): Promise<User> {
    const { email, password } = authLoginDto;

    const user = await this.usersService.findByEmail(email);
    if (!(await user?.validatePassword(password))) {
      throw new UnauthorizedException();
    }

    return await User.findOne(user.id, {
      relations: ['profile'],
    });
  }

  async register(registerDto: RegisterDto) {
    try {
      const count = (await User.find({ role: Roles.USER })).length;
      const userData = {
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        email: registerDto.email,
        password: registerDto.password,
        phone: String(registerDto.phone),
        username: 'AGT-' + count,
        isActive: false,
      };

      const user = User.create(userData);
      await user.save();

      const profile = new UserProfile();
      profile.city = registerDto.city;
      profile.state = registerDto.state;
      profile.pan = '';
      profile.company = registerDto.company || '';

      await profile.save();

      user.profile = profile;
      await user.save();

      delete user.password;

      return {
        success: true,
        message: 'Registration successfully!',
        data: user,
      };
    } catch (err) {
      return {
        success: false,
        message: 'Failed to create account!',
        data: null,
      };
    }
  }

  async getUserDetails(id: string) {
    try {
      const user = await User.findOneOrFail(id);
      delete user.password;
      return {
        success: true,
        user: user,
      };
    } catch (err) {
      return {
        success: false,
        user: null,
      };
    }
  }
}
