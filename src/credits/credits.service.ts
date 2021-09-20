import { Injectable } from '@nestjs/common';
import { paginate } from 'nestjs-typeorm-paginate';
import { Like } from 'typeorm';
import { CreateCreditDto } from './dto/create-credit.dto';
import { UpdateCreditDto } from './dto/update-credit.dto';
import { Credit } from './entities/credit.entity';

@Injectable()
export class CreditsService {
  create(createCreditDto: CreateCreditDto) {
    return 'This action adds a new credit';
  }

  async findAll(userId: string, page: string, limit: string, keyword: string) {
    const _keyword = keyword || '';
    const _page = page ? parseInt(page) : 1;
    const _limit = limit ? parseInt(limit) : 10;
    const results = await paginate(
      Credit.getRepository(),
      { page: _page, limit: _limit },
      {
        where: {
          user: { id: Like(userId) },
        },
        relations: ['passengers', 'ticket'],
      },
    );
    return {
      status: true,
      message: 'Credit fetched successfully',
      data: results,
      meta: results.meta,
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} credit`;
  }

  update(id: number, updateCreditDto: UpdateCreditDto) {
    return `This action updates a #${id} credit`;
  }

  remove(id: number) {
    return `This action removes a #${id} credit`;
  }
}

@Injectable()
export class CreditsAdminService {
  async findAllCredits(page: string, limit: string, keyword: string) {
    const _keyword = keyword || '';
    const _page = page ? parseInt(page) : 1;
    const _limit = limit ? parseInt(limit) : 10;
    const results = await paginate(
      Credit.getRepository(),
      { page: _page, limit: _limit },
      {
        relations: ['agent'],
      },
    );
    return {
      status: true,
      message: 'Credit fetched successfully',
      data: results,
      meta: results.meta,
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} credit`;
  }

  update(id: number, updateCreditDto: UpdateCreditDto) {
    return `This action updates a #${id} credit`;
  }

  remove(id: number) {
    return `This action removes a #${id} credit`;
  }
}
