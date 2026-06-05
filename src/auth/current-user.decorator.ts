import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { UserRole } from './user.entity';

export type AuthUser = {
  sub: string;
  username: string;
  role: UserRole;
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser | undefined => {
    const req = ctx.switchToHttp().getRequest();
    return req.user as AuthUser | undefined;
  },
);
