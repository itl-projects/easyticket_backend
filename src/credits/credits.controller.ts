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
import { AddFundCreditDto } from './dto/add-fund.dto';
import { CreateCreditDto } from './dto/create-credit.dto';
import { FindCreditDto } from './dto/find-credit.dto';
import { UpdateCreditDto } from './dto/update-credit.dto';

@ApiTags('Credits')
@UseGuards(JwtAuthGuard, RolesGuard)
@RolesAllowed(Roles.USER)
@Controller('credits')
export class CreditsController {
  constructor(private readonly creditsService: CreditsService) {}

  @Post()
  create(@Req() request, @Body() createCreditDto: CreateCreditDto) {
    return this.creditsService.create(request.user.userId, createCreditDto);
  }

  @Post('agent-credits')
  findAll(@Req() request, @Body() findCreditDto: FindCreditDto) {
    return this.creditsService.findAll(request.user.userId, findCreditDto);
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

  @Post('add-fund')
  addFund(@Body() addFundCreditDto: AddFundCreditDto) {
    return this.creditsAdminService.addFund(addFundCreditDto);
  }

  @Post('requests')
  findAll(@Req() request, @Body() findCreditDto: FindCreditDto) {
    return this.creditsAdminService.findAll(request.user.userId, findCreditDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.creditsAdminService.findOne(id);
  }

  @Patch('approve/:id')
  approveRequest(@Param('id') id: string) {
    return this.creditsAdminService.approveCreditRequest(id);
  }

  @Patch('settle/:id')
  settleRequest(@Param('id') id: string) {
    return this.creditsAdminService.settleCreditRequest(id);
  }

  @Patch('decline/:id')
  calcelRequest(@Param('id') id: string) {
    return this.creditsAdminService.cancelCreditRequest(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.creditsAdminService.remove(id);
  }
}
