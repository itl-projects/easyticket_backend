import { Module } from '@nestjs/common';
import { MarkupService, SettingsService } from './settings.service';
import { MarkupController, SettingsController } from './settings.controller';

@Module({
  controllers: [SettingsController, MarkupController],
  providers: [SettingsService, MarkupService],
})
export class SettingsModule {}
