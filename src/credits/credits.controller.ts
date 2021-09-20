import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RolesAllowed } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/constants/Roles';
import { CreditsAdminService, CreditsService } from './credits.service';
import { CreateCreditDto } from './dto/create-credit.dto';
import { UpdateCreditDto } from './dto/update-credit.dto';

@ApiTags('Credits')
@UseGuards(JwtAuthGuard, RolesGuard)
@RolesAllowed(Roles.USER)
@Controller('credits')
export class CreditsController {
  constructor(private readonly creditsService: CreditsService) {}

  @Post()
  create(@Body() createCreditDto: CreateCreditDto) {
    return this.creditsService.create(createCreditDto);
  }

  @Get()
  findAll(
    @Req() request,
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('keyword') keyword: string,
  ) {
    return this.creditsService.findAll(
      request.user.userId,
      page,
      limit,
      keyword,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.creditsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCreditDto: UpdateCreditDto) {
    return this.creditsService.update(+id, updateCreditDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.creditsService.remove(+id);
  }
}

@ApiTags('Credits Admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@RolesAllowed(Roles.ADMIN)
@Controller('credits-admin')
export class CreditsAdminController {
  constructor(private readonly creditsAdminService: CreditsAdminService) {}

  @Get()
  findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('keyword') keyword: string,
  ) {
    return this.creditsAdminService.findAllCredits(page, limit, keyword);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.creditsAdminService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCreditDto: UpdateCreditDto) {
    return this.creditsAdminService.update(+id, updateCreditDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.creditsAdminService.remove(+id);
  }
}
