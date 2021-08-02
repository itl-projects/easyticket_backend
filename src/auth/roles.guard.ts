import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from '../constants/Roles';
import { User } from '../users/entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles =
      this.reflector.getAllAndMerge<Roles[]>('roles', [
        context.getClass(),
        context.getHandler(),
      ]) || [];

    const isPublic = this.reflector.getAllAndOverride<boolean>('public', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!roles || isPublic) {
      return true;
    }

    let isAllowed = false;
    if (!context.switchToHttp().getRequest().user.userId) {
      throw new UnauthorizedException();
    }

    const requestUser = await User.findOneOrFail({
      id: context.switchToHttp().getRequest().user.userId,
    });

    roles.forEach((role) => {
      if ((requestUser.role && role) === role) {
        isAllowed = true;
      }
    });

    return isAllowed;
  }
}
