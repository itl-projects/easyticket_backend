import { Injectable } from '@nestjs/common';
import { paginate } from 'nestjs-typeorm-paginate';
import { User } from 'src/users/entities/user.entity';
import { Like } from 'typeorm';
import { AddFundCreditDto } from './dto/add-fund.dto';
import { CreateCreditDto } from './dto/create-credit.dto';
import { FindCreditDto } from './dto/find-credit.dto';
import { UpdateCreditDto } from './dto/update-credit.dto';
import { Credit } from './entities/credit.entity';

@Injectable()
export class CreditsService {
  async create(userId: string, createCreditDto: CreateCreditDto) {
    try {
      const currDate = new Date();
      const user = await User.findOne(userId);
      const newCredit = Credit.create({
        ...createCreditDto,
        agent: user,
        requestDate: currDate,
      });
      await newCredit.save();
      return {
        success: true,
        message: 'Credit request sent successfully',
      };
    } catch (err) {
      return {
        success: false,
        message: 'Sorry! Failed to send credit request.',
      };
    }
  }

  async findAll(userId: string, findCreditDto: FindCreditDto) {
    const _page = findCreditDto.page ? findCreditDto.page : 1;
    const _limit = findCreditDto.limit ? findCreditDto.limit : 10;
    const results = await paginate(
      Credit.getRepository(),
      { page: _page, limit: _limit },
      {
        where: {
          agent: { id: Like(userId) },
        },
      },
    );
    return {
      success: true,
      message: 'Credit fetched successfully',
      data: results.items,
      meta: results.meta,
    };
  }

  remove(id: number) {
    return `This action removes a #${id} credit`;
  }
}

@Injectable()
export class CreditsAdminService {
  async addFund(addFundCreditDto: AddFundCreditDto) {
    try {
      const currDate = new Date();
      const user = await User.findOne(addFundCreditDto.agent);
      const newCredit = Credit.create({
        ...addFundCreditDto,
        agent: user,
        requestDate: currDate,
        status: 'approved',
      });
      await newCredit.save();
      user.commision += addFundCreditDto.amount;
      await user.save();
      return {
        success: true,
        message: 'Fund added to agent account successfully',
      };
    } catch (err) {
      return {
        success: false,
        message: 'Sorry! Failed to send fund to agent account.',
      };
    }
  }

  async findAll(userId: string, findCreditDto: FindCreditDto) {
    const _page = findCreditDto.page ? findCreditDto.page : 1;
    const _limit = findCreditDto.limit ? findCreditDto.limit : 10;
    const results = await paginate(
      Credit.getRepository(),
      {
        page: _page,
        limit: _limit,
      },
      {
        relations: ['agent', 'agent.profile'],
      },
    );
    return {
      success: true,
      message: 'Credit fetched successfully',
      data: results.items,
      meta: results.meta,
    };
  }

  findOne(id: string) {
    return `This action returns a #${id} credit`;
  }

  update(id: string, updateCreditDto: UpdateCreditDto) {
    return `This action updates a #${id} credit`;
  }

  async approveCreditRequest(id: string) {
    try {
      const currCredit = await Credit.findOneOrFail(id, {
        relations: ['agent'],
      });
      if (!currCredit) {
        return {
          success: false,
          message: 'Failed! No such credit request found.',
        };
      }
      const user = await User.findOneOrFail(currCredit.agent.id);
      user.commision += currCredit.amount;
      await user.save();
      currCredit.status = 'approved';
      currCredit.transferDate = new Date();
      await currCredit.save();
      return {
        success: true,
        message: 'Credit request approved successfully',
      };
    } catch (err) {
      return {
        success: false,
        message: 'Failed to approve credit request',
      };
    }
  }

  async cancelCreditRequest(id: string) {
    try {
      const currCredit = await Credit.findOne(id);
      if (!currCredit) {
        return {
          success: false,
          message: 'Failed to decline credit request',
        };
      }
      currCredit.status = 'cancelled';
      // currCredit.transferDate = new Date();
      await currCredit.save();
      return {
        success: true,
        message: 'Credit request declined successfully',
      };
    } catch (err) {
      return {
        success: true,
        message: 'Failed to decline credit request',
      };
    }
  }

  async settleCreditRequest(id: string) {
    try {
      const currCredit = await Credit.findOne(id);
      if (!currCredit) {
        return {
          success: false,
          message: 'Failed to settled credit request',
        };
      }
      currCredit.status = 'settled';
      // currCredit.transferDate = new Date();
      await currCredit.save();
      return {
        success: true,
        message: 'Credit request settled successfully',
      };
    } catch (err) {
      return {
        success: true,
        message: 'Failed to decline settle request',
      };
    }
  }

  remove(id: string) {
    return `This action removes a #${id} credit`;
  }
}
