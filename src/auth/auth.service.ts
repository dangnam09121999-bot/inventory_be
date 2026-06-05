import {
  Injectable,
  NotFoundException,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from './user.entity';

type SeedUser = { username: string; password: string; role: UserRole };

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.ensureSeedUsers();
  }

  private async ensureSeedUsers(): Promise<void> {
    const seeds: SeedUser[] = [
      { username: 'namdpa', password: '123123', role: 'warehouse' },
      { username: 'viewer', password: 'viewer123', role: 'viewer' },
    ];

    for (const seed of seeds) {
      const existing = await this.userRepository.findOne({
        where: { username: seed.username },
      });
      if (!existing) {
        const hash = await bcrypt.hash(seed.password, 10);
        await this.userRepository.save(
          this.userRepository.create({
            username: seed.username,
            password: hash,
            role: seed.role,
            isActive: true,
          }),
        );
      }
    }

    // Legacy: nếu vẫn còn user 'admin' từ phiên bản cũ, đảm bảo nó là warehouse
    const legacyAdmin = await this.userRepository.findOne({
      where: { username: 'admin' },
    });
    if (legacyAdmin && legacyAdmin.role !== 'warehouse') {
      legacyAdmin.role = 'warehouse';
      await this.userRepository.save(legacyAdmin);
    }
  }

  private async verifyPassword(user: User, password: string): Promise<boolean> {
    // Migration support: nếu password chưa hash (plaintext cũ) → so sánh trực tiếp rồi hash lại
    if (!user.password.startsWith('$2')) {
      if (user.password === password) {
        user.password = await bcrypt.hash(password, 10);
        await this.userRepository.save(user);
        return true;
      }
      return false;
    }
    return bcrypt.compare(password, user.password);
  }

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) return null;
    if (!user.isActive) return null;
    const ok = await this.verifyPassword(user, password);
    return ok ? user : null;
  }

  async login(
    username: string,
    password: string,
  ): Promise<{
    access_token: string;
    user: { id: string; username: string; role: UserRole };
  }> {
    const user = await this.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException('Sai tên đăng nhập hoặc mật khẩu');
    }

    const payload = { sub: user.id, username: user.username, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    };
  }

  verify(token: string): any {
    return this.jwtService.verify(token);
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<{ ok: true }> {
    if (!newPassword || newPassword.length < 4) {
      throw new UnauthorizedException('Mật khẩu mới quá ngắn (tối thiểu 4 ký tự)');
    }
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Không tìm thấy user');
    const ok = await this.verifyPassword(user, oldPassword);
    if (!ok) throw new UnauthorizedException('Mật khẩu cũ không đúng');
    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);
    return { ok: true };
  }
}
