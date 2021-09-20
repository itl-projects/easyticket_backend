import { Module } from '@nestjs/common';
import { CreditsAdminService, CreditsService } from './credits.service';
import {
  CreditsAdminController,
  CreditsController,
} from './credits.controller';

@Module({
  controllers: [CreditsController, CreditsAdminController],
  providers: [CreditsService, CreditsAdminService],
})
export class CreditsModule {}
