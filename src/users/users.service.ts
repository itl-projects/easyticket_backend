import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/profile.entity';
import { paginate } from 'nestjs-typeorm-paginate';
import { In, Like, Not } from 'typeorm';
import { Roles } from 'src/constants/Roles';
import { UpdateAccountStatusDto } from './dto/update-account-status-dto';
import { MarkUp } from 'src/settings/entities/markup.entity';
import { UserMarkup } from './entities/markup.entity';
import { UserMarkupsDto } from './dto/user-markup.dto';
import { ChangePasswordDto } from './dto/change-password.dto.';
import { UpdateProfileInfoDto } from './dto/profile-info-update.dto';
import { UserFilter } from './dto/user-filter.dto';

@Injectable()
export class UsersService {
  async create(createUserDto: CreateUserDto) {
    if (createUserDto.role === Roles.ADMIN) {
      return {
        success: false,
        message: 'User Type not found!',
      };
    }
    const user_data = { ...createUserDto, isActive: true };

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
          'isActive',
          'creationDate',
        ],
        where: {
          firstName: Like('%' + _keyword + '%'),
          role: Not(Roles.ADMIN),
        },
        relations: ['profile', 'markup'],
      },
    );
  }

  async filterUser(userFilter: UserFilter) {
    const _page = userFilter.page ? userFilter.page : 1;
    const _limit = userFilter.limit ? userFilter.limit : 10;
    const conditions = { role: Not(Roles.ADMIN) };
    let profiles = [];
    if (userFilter.city && userFilter.city !== 'all') {
      const profilesIds = await UserProfile.find({
        select: ['id'],
        where: { city: Like(`%${userFilter.city}%`) },
      });
      profiles = profilesIds.map((el) => el.id);
      conditions['profile'] = In(profiles);
    }
    if (userFilter.state && userFilter.state !== 'all') {
      const profilesIds = await UserProfile.find({
        select: ['id'],
        where: { state: Like(`%${userFilter.state}%`) },
      });
      if (profiles.length > 0) {
        conditions['profile'] = In([
          ...profiles,
          ...profilesIds.map((el) => el.id),
        ]);
      } else conditions['profile'] = In(profilesIds.map((el) => el.id));
    }
    if (userFilter.phone) {
      conditions['phone'] = Like(`%${userFilter.phone}%`);
    }
    if (userFilter.status !== -1) {
      conditions['isActive'] = userFilter.status ? true : false;
    }
    if (userFilter.userRef) {
      conditions['username'] = Like(`%${userFilter.userRef}%`);
    }
    if (userFilter.userType) {
      conditions['role'] =
        userFilter.userType === 1 ? In([Roles.USER]) : In([Roles.SUPPLIER]);
    }
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
          'isActive',
          'creationDate',
        ],
        where: conditions,
        relations: ['profile', 'markup'],
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
      where: [
        {
          email: email,
        },
        {
          phone: email,
        },
      ],
    });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  async updateAccountStatus(
    id: string,
    updateAccountStatusDto: UpdateAccountStatusDto,
  ) {
    try {
      const user = await User.findOne(id);
      if (user) {
        user.isActive = updateAccountStatusDto.status;
        await user.save();
        return {
          success: true,
          message: 'Account status changes successfully',
        };
      }
      return {
        success: false,
        message: 'Failed to update account status',
      };
    } catch (err) {
      return {
        success: false,
        message: 'Failed to update account status',
      };
    }
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async getActiveUsers() {
    try {
      const users = await User.find({
        where: {
          role: In([1, 3]),
        },
        select: ['role', 'isActive'],
        order: { role: 'ASC' },
      });
      if (users.length <= 0) {
        return {
          success: false,
        };
      }
      return {
        success: true,
        data: {
          agents: {
            total: users.filter((el) => el.role === 1).length,
            active: users.filter((el) => el.role === 1 && el.isActive).length,
          },
          suppliers: {
            total: users.filter((el) => el.role === 3).length,
            active: users.filter((el) => el.role === 3 && el.isActive).length,
          },
        },
      };
    } catch (err) {
      console.log(err);
      return {
        success: false,
      };
    }
  }

  async findByUsername(name: string) {
    try {
      const users = await User.createQueryBuilder()
        .where('role =:role', { role: Roles.USER })
        .orHaving('username LIKE :username', {
          username: name,
        })
        .orHaving('lastName LIKE :lastName', {
          lastName: name,
        })
        .orHaving('firstName LIKE :firstName', {
          firstName: name,
        })
        .getMany();

      return {
        success: true,
        users: users.map((item) => ({
          username: item.username,
          id: item.id,
          firstName: item.firstName,
          lastName: item.lastName,
        })),
      };
    } catch (err) {
      return {
        success: false,
        message: 'Sorry! failed to find markups',
      };
    }
  }

  async getAllCities() {
    try {
      const cities = await UserProfile.createQueryBuilder()
        .select(['DISTINCT (UserProfile.city) as city'])
        .getRawMany();
      return {
        success: true,
        data: cities,
      };
    } catch (err) {
      return {
        success: false,
        data: [],
      };
    }
  }

  async getAllStates() {
    try {
      const cities = await UserProfile.createQueryBuilder()
        .select(['DISTINCT (UserProfile.state) as state'])
        .getRawMany();
      return {
        success: true,
        data: cities,
      };
    } catch (err) {
      return {
        success: false,
        data: [],
      };
    }
  }
}

@Injectable()
export class UsersMarkupService {
  async create(userMarkupsDto: UserMarkupsDto) {
    try {
      const user = await User.findOneOrFail(userMarkupsDto.agentId, {
        loadRelationIds: true,
      });
      if (!user) {
        return {
          success: false,
          message: 'Sorry! Specified user not found',
        };
      }
      const markup = await MarkUp.findOneOrFail(userMarkupsDto.markupId);
      if (!markup) {
        return {
          success: false,
          message: 'Sorry! Markup not found',
        };
      }
      if (user.markup) {
        await User.createQueryBuilder()
          .update()
          .set({ markup: markup })
          .where('id =:user', {
            user: user.id,
          })
          .execute();

        return {
          success: true,
          message: 'Markup updated successfully !',
        };
      } else {
        user.markup = markup;
        await user.save();
        return {
          success: true,
          message: 'Markup added to user successfully !',
        };
      }
    } catch (err) {
      console.log('Error : ', err);
      return {
        success: false,
        message: 'Sorry! Failed update markup',
      };
    }
  }

  async findById(id: string) {
    try {
      const userMarkup = await UserMarkup.findOne(id);
      return {
        success: true,
        markup: userMarkup,
      };
    } catch (err) {
      return {
        success: false,
        message: 'Sorry! failed to find markups',
      };
    }
  }

  async remove(userId: string) {
    try {
      const user = await User.createQueryBuilder()
        .update()
        .set({ markup: null })
        .where('id =:user', {
          user: userId,
        })
        .execute();
      if (user) {
        return {
          success: true,
          message: 'Markup removed successfully!',
        };
      }
      return {
        success: false,
        message: 'Sorry! Failed to remove user markup',
      };
    } catch (err) {
      return {
        success: false,
        message: 'Sorry! Failed remove user markup',
      };
    }
  }
}

@Injectable()
export class AgentProfileService {
  async toggleTicketLogo(userId: string) {
    try {
      const user = await User.findOneOrFail(userId);
      if (user) {
        user.ticketLogoEnabled = !user.ticketLogoEnabled;
        await user.save();
        return {
          success: true,
          message: 'Ticket logo status changed successfully',
          ticketLogoStatus: user.ticketLogoEnabled,
        };
      }
      return {
        success: false,
        message: 'Failed to update ticket logo status',
      };
    } catch (err) {
      return {
        success: false,
        message: 'Failed to update ticket logo status',
      };
    }
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    try {
      const user = await User.findOneOrFail(userId);
      if (user) {
        if (!(await user.validatePassword(changePasswordDto.oldPassword))) {
          return {
            success: false,
            message: "Failed! old password doesn't matched",
          };
        }
        user.password = await user.hashNewPassword(
          changePasswordDto.newPassword,
        );
        await user.save();
        return {
          success: true,
          message: 'Password changed successfully',
        };
      }
      return {
        success: false,
        message: 'Failed user not found.',
      };
    } catch (err) {
      return {
        success: false,
        message: 'Failed to change user password',
      };
    }
  }

  async changeProfileImage(userId: string, path: string) {
    try {
      const user = await User.findOneOrFail(userId, { relations: ['profile'] });
      if (user) {
        user.profile.profile_image = path.replace(/\\/g, '\\');
        await user.profile.save();
        delete user.password;
        return {
          success: true,
          message: 'Profile image changed successfully',
          imagePath: path.replace(/\\/g, '\\'),
          user,
        };
      }
      return {
        success: false,
        message: 'Failed user not found.',
      };
    } catch (err) {
      console.log(err);
      return {
        success: false,
        message: 'Failed to change profile image ',
      };
    }
  }

  async updateProfileInfo(
    userId: string,
    updateProfileInfoDto: UpdateProfileInfoDto,
  ) {
    try {
      const user = await User.findOneOrFail(userId, { relations: ['profile'] });
      if (user) {
        const profile = await UserProfile.findOneOrFail(user.profile.id);
        user.firstName = updateProfileInfoDto.firstName;
        user.lastName = updateProfileInfoDto.lastName;
        await user.save();
        profile.address = updateProfileInfoDto.address;
        profile.company = updateProfileInfoDto.company;
        await profile.save();
        return {
          success: true,
          message: 'Profile info updated successfully',
        };
      }
      return {
        success: false,
        message: 'Failed to updated profile info',
      };
    } catch (err) {
      console.log(err);
      return {
        success: false,
        message: 'Failed to update profile info',
      };
    }
  }
}
