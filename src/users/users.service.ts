import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from '../auth/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  async list() {
    const users = await this.repo.find({ order: { createdAt: 'ASC' } });
    return users.map(({ password: _password, ...rest }) => rest);
  }

  async create(payload: {
    username: string;
    password: string;
    role: UserRole;
    isActive?: boolean;
  }) {
    const username = payload.username?.trim();
    if (!username) throw new BadRequestException('Thiếu tên đăng nhập');
    if (!payload.password || payload.password.length < 4) {
      throw new BadRequestException('Mật khẩu tối thiểu 4 ký tự');
    }
    if (!['warehouse', 'viewer'].includes(payload.role)) {
      throw new BadRequestException('Role không hợp lệ');
    }

    const existing = await this.repo.findOne({ where: { username } });
    if (existing) throw new ConflictException('Tên đăng nhập đã tồn tại');

    const hash = await bcrypt.hash(payload.password, 10);
    const user = this.repo.create({
      username,
      password: hash,
      role: payload.role,
      isActive: payload.isActive ?? true,
    });
    const saved = await this.repo.save(user);
    const { password: _password, ...rest } = saved;
    return rest;
  }

  async update(
    id: string,
    payload: { role?: UserRole; isActive?: boolean },
    actingUserId: string,
  ) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Không tìm thấy user');

    if (payload.role && !['warehouse', 'viewer'].includes(payload.role)) {
      throw new BadRequestException('Role không hợp lệ');
    }

    // Không cho hạ role / khoá chính mình
    if (id === actingUserId) {
      if (payload.role && payload.role !== user.role) {
        throw new BadRequestException('Không thể đổi role của chính mình');
      }
      if (payload.isActive === false) {
        throw new BadRequestException('Không thể khoá chính mình');
      }
    }

    // Không cho hạ role / khoá warehouse cuối cùng
    if (
      user.role === 'warehouse' &&
      ((payload.role && payload.role !== 'warehouse') ||
        payload.isActive === false)
    ) {
      const activeWarehouses = await this.repo.count({
        where: { role: 'warehouse', isActive: true },
      });
      if (activeWarehouses <= 1) {
        throw new BadRequestException(
          'Không thể thay đổi: phải còn ít nhất 1 thủ kho đang hoạt động',
        );
      }
    }

    if (payload.role) user.role = payload.role;
    if (typeof payload.isActive === 'boolean') user.isActive = payload.isActive;
    const saved = await this.repo.save(user);
    const { password: _password, ...rest } = saved;
    return rest;
  }

  async resetPassword(id: string, newPassword: string) {
    if (!newPassword || newPassword.length < 4) {
      throw new BadRequestException('Mật khẩu tối thiểu 4 ký tự');
    }
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Không tìm thấy user');
    user.password = await bcrypt.hash(newPassword, 10);
    await this.repo.save(user);
    return { ok: true };
  }

  async remove(id: string, actingUserId: string) {
    if (id === actingUserId) {
      throw new BadRequestException('Không thể xoá chính mình');
    }
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Không tìm thấy user');

    if (user.role === 'warehouse') {
      const activeWarehouses = await this.repo.count({
        where: { role: 'warehouse', isActive: true },
      });
      if (activeWarehouses <= 1) {
        throw new BadRequestException(
          'Không thể xoá: phải còn ít nhất 1 thủ kho đang hoạt động',
        );
      }
    }

    await this.repo.remove(user);
    return { deleted: true };
  }
}
