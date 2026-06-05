import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/current-user.decorator';
import { Roles } from '../auth/roles.decorator';
import type { UserRole } from '../auth/user.entity';
import { UsersService } from './users.service';

@Controller('users')
@Roles('warehouse')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  list() {
    return this.usersService.list();
  }

  @Post()
  create(
    @Body()
    body: {
      username: string;
      password: string;
      role: UserRole;
      isActive?: boolean;
    },
  ) {
    return this.usersService.create(body);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: { role?: UserRole; isActive?: boolean },
    @CurrentUser() user: AuthUser,
  ) {
    return this.usersService.update(id, body, user.sub);
  }

  @Patch(':id/reset-password')
  resetPassword(
    @Param('id') id: string,
    @Body() body: { newPassword: string },
  ) {
    return this.usersService.resetPassword(id, body.newPassword);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.usersService.remove(id, user.sub);
  }
}
