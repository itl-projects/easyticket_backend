import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UsersMarkupService, UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/constants/Roles';
import { RolesAllowed } from 'src/auth/decorators/roles.decorator';
import { UpdateAccountStatusDto } from './dto/update-account-status-dto';
import { UserMarkupsDto } from './dto/user-markup.dto';

@ApiTags('Users')
@UseGuards(JwtAuthGuard, RolesGuard)
@RolesAllowed(Roles.ADMIN)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get('get-active-users')
  getActiveUsers() {
    return this.usersService.getActiveUsers();
  }

  @Get(':id')
  show(@Param('id') id: string) {
    const user = this.usersService.showById(id);
    if (user) {
      return {
        status: true,
        message: 'User found',
        data: user,
      };
    }

    return {
      status: false,
      message: 'Invalid ID',
      data: null,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('keyword') keyword: string,
  ) {
    return this.usersService.findAll(page, limit, keyword);
  }

  @Patch('changeAccountStatus/:id')
  updateAccountStatus(
    @Param('id') id: string,
    @Body() updateAccountStatusDto: UpdateAccountStatusDto,
  ) {
    return this.usersService.updateAccountStatus(id, updateAccountStatusDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}

@ApiTags('Users')
@UseGuards(JwtAuthGuard, RolesGuard)
@RolesAllowed(Roles.ADMIN)
@Controller('users/markup')
export class UserMarkupController {
  constructor(private readonly usersMarkupService: UsersMarkupService) {}

  @Post()
  create(@Body() userMarkupsDto: UserMarkupsDto) {
    return this.usersMarkupService.create(userMarkupsDto);
  }

  @Get(':id')
  show(@Param('id') id: string) {
    const mockup = this.usersMarkupService.findById(id);
    if (mockup) {
      return {
        status: true,
        message: 'Mockup found',
        data: mockup,
      };
    }

    return {
      status: false,
      message: 'Invalid ID',
      data: null,
    };
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersMarkupService.remove(id);
  }
}
