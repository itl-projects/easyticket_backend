import { Injectable } from '@nestjs/common';
import { paginate } from 'nestjs-typeorm-paginate';
import { ILike } from 'typeorm';
import { CreateMarkupDto } from './dto/create-markup.dto';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { MarkUp } from './entities/markup.entity';

@Injectable()
export class SettingsService {
  create(createSettingDto: CreateSettingDto) {
    return 'This action adds a new setting';
  }
  createMarkup(createMarkupDto: CreateMarkupDto) {
    return 'This action adds a new setting';
  }

  findAll() {
    return `This action returns all settings`;
  }

  findOne(id: number) {
    return `This action returns a #${id} setting`;
  }

  update(id: number, updateSettingDto: UpdateSettingDto) {
    return `This action updates a #${id} setting`;
  }

  remove(id: number) {
    return `This action removes a #${id} setting`;
  }
}

@Injectable()
export class MarkupService {
  async create(createMarkupDto: CreateMarkupDto) {
    try {
      const oldMarkup = await MarkUp.createQueryBuilder()
        .where({
          name: ILike(createMarkupDto.name.trim()),
        })
        .getOne();
      console.log(oldMarkup);
      if (oldMarkup) {
        return {
          success: false,
          message: 'Markup with same name already exists!',
        };
      }
      const markup = MarkUp.create(createMarkupDto);
      await markup.save();
      return {
        success: true,
        message: 'Markup saved successfully!',
      };
    } catch (err) {
      return {
        success: false,
        message: 'Sory! Failed to save markup',
      };
    }
  }

  async getAllMarkups() {
    const res = await MarkUp.createQueryBuilder().getMany();

    return {
      success: true,
      data: res,
    };
  }

  async findAll(page: string, limit: string) {
    const _page = page ? parseInt(page) : 1;
    const _limit = limit ? parseInt(limit) : 10;
    const res = await paginate(
      MarkUp.getRepository(),
      { page: _page, limit: _limit },
      {},
    );

    return {
      success: true,
      data: res,
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} setting`;
  }

  update(id: number, updateSettingDto: UpdateSettingDto) {
    return `This action updates a #${id} setting`;
  }

  remove(id: number) {
    return `This action removes a #${id} setting`;
  }
}
