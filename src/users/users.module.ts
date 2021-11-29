import { Module } from '@nestjs/common';
import {
  ProfileService,
  UsersMarkupService,
  UsersService,
} from './users.service';
import {
  AgentController,
  UserMarkupController,
  UsersController,
} from './users.controller';

@Module({
  controllers: [UsersController, UserMarkupController, AgentController],
  providers: [UsersService, UsersMarkupService, ProfileService],
})
export class UsersModule {}
