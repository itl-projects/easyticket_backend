import { Module } from '@nestjs/common';
import { UsersMarkupService, UsersService } from './users.service';
import { UserMarkupController, UsersController } from './users.controller';

@Module({
  controllers: [UsersController, UserMarkupController],
  providers: [UsersService, UsersMarkupService],
})
export class UsersModule {}
