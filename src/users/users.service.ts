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
    const user_data = { ...createUserDto };

    if (!createUserDto.commision) {
      delete user_data.commision;
    }
    const user = User.create(user_data);
    const count = (await User.find({ role: createUserDto.role })).length;
    user.username =
      createUserDto.role === Roles.USER ? 'AGT-' + count : 'SUP-' + count;

    await user.save();

    const profile = new UserProfile();
    profile.city = createUserDto.city;
    profile.state = createUserDto.state;
    profile.pan = createUserDto.pan || '';
    profile.company = createUserDto.company;
    await profile.save();
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
    const _page = page ? parseInt(page) : 1;
    const _limit = limit ? parseInt(limit) : 10;
    return paginate(
      User.getRepository(),
      { page: _page, limit: _limit },
      {
        select: [
          'email',
          'phone',
          'commision',
          'firstName',
          'lastName',
          'id',
          'profile',
          'role',
          'username',
          'creationDate',
        ],
        where: {
          firstName: Like('%' + _keyword + '%'),
          role: Not(Roles.ADMIN),
        },
        relations: ['profile'],
      },
    );
  }

  async showById(id: string): Promise<User | null> {
    const user = await User.findOne(id, { relations: ['profile'] });
    if (user) delete user.password;
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
