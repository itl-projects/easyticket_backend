import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/profile.entity';
import { paginate } from 'nestjs-typeorm-paginate';
import { Like, Not } from 'typeorm';
import { Roles } from 'src/constants/Roles';

@Injectable()
export class UsersService {
  async create(createUserDto: CreateUserDto) {
    const profile = new UserProfile();
    profile.city = createUserDto.city;
    profile.state = createUserDto.state;
    profile.pan = createUserDto.pan;
    profile.company = createUserDto.company;
    await profile.save();

    const user = User.create(createUserDto);
    const count = (await User.find({ role: createUserDto.role })).length;
    user.username =
      createUserDto.role === Roles.USER ? 'AGT-' + count : 'SUP-' + count;
    user.profile = profile;
    await user.save();

    delete user.password;

    return {
      success: true,
      message: 'User Added successfully!',
      data: user,
    };
  }

  async findAll(page: string, limit: string, keyword: string) {
    const _keyword = keyword || '';
    return paginate(
      User.getRepository(),
      { page, limit },
      {
        where: {
          firstName: Like('%' + _keyword + '%'),
          role: Not(Roles.ADMIN),
        },

        relations: ['profile'],
      },
    );
  }

  async showById(id: string): Promise<User> {
    const user = await User.findOne(id, { relations: ['profile'] });

    delete user.password;
    return user;
  }

  async findByEmail(email: string) {
    return await User.findOne({
      where: {
        email: email,
      },
    });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
