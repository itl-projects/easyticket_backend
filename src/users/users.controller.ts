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
  UseInterceptors,
  UploadedFile,
  Req,
  Res,
} from '@nestjs/common';
import {
  AgentProfileService,
  UsersMarkupService,
  UsersService,
} from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/constants/Roles';
import { RolesAllowed } from 'src/auth/decorators/roles.decorator';
import { UpdateAccountStatusDto } from './dto/update-account-status-dto';
import { UserMarkupsDto } from './dto/user-markup.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ChangePasswordDto } from './dto/change-password.dto.';
import { profileImageStorage } from 'src/commons/multerOptions';
import { UpdateProfileInfoDto } from './dto/profile-info-update.dto';
import { UserFilter } from './dto/user-filter.dto';

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

  @Get('get-cities')
  getCities() {
    return this.usersService.getAllCities();
  }

  @Get('get-states')
  getStates() {
    return this.usersService.getAllStates();
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
  @Post('list-users')
  findAll(@Body() userFilter: UserFilter) {
    return this.usersService.filterUser(userFilter);
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

  @Get('match-user/:name')
  findByUsername(@Param('name') name: string) {
    return this.usersService.findByUsername(name);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}

@ApiTags('User Markups')
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

// Agent profile controller
@ApiTags('Agent Profile')
@UseGuards(JwtAuthGuard, RolesGuard)
@RolesAllowed(Roles.USER)
@Controller('agent-profile')
export class AgentController {
  constructor(private readonly agentProfileService: AgentProfileService) {}

  @Get('toggle-ticket-logo')
  toggleTicketLogo(@Req() request) {
    return this.agentProfileService.toggleTicketLogo(request.user.userId);
  }

  @Post('upload-profile-image')
  @UseInterceptors(FileInterceptor('file', { storage: profileImageStorage }))
  uploadFile(@UploadedFile() file: Express.Multer.File, @Req() request) {
    return this.agentProfileService.changeProfileImage(
      request.user.userId,
      file.path,
    );
  }

  @Get('avatars/:fileId')
  async serveAvatar(@Param('fileId') fileId, @Res() res): Promise<any> {
    res.sendFile(fileId, { root: 'avatars' });
  }

  @Post('change-password')
  changePassword(@Req() request, @Body() changePasswordDto: ChangePasswordDto) {
    return this.agentProfileService.changePassword(
      request.user.userId,
      changePasswordDto,
    );
  }

  @Post('update-profile-info')
  updateProfileInfo(
    @Req() request,
    @Body() updateProfileInfoDto: UpdateProfileInfoDto,
  ) {
    return this.agentProfileService.updateProfileInfo(
      request.user.userId,
      updateProfileInfoDto,
    );
  }
}
