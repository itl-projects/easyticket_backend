import { Module } from '@nestjs/common';
import {
  AgentProfileService,
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
  providers: [UsersService, UsersMarkupService, AgentProfileService],
})
export class UsersModule {}
