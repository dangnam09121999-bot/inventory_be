import { Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.ensureDefaultUser();
  }

  private async ensureDefaultUser(): Promise<void> {
    const username = this.configService.get<string>('DEFAULT_ADMIN_USERNAME', 'admin');
    const password = this.configService.get<string>('DEFAULT_ADMIN_PASSWORD', 'admin123');

    const existingUser = await this.userRepository.findOne({ where: { username } });
    if (!existingUser) {
      const user = this.userRepository.create({ username, password });
      await this.userRepository.save(user);
    }
  }

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user || user.password !== password) {
      return null;
    }
    return user;
  }

  async login(
    username: string,
    password: string,
  ): Promise<{ access_token: string; user: { id: string; username: string } }> {
    const user = await this.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, username: user.username };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
      },
    };
  }

  verify(token: string): any {
    return this.jwtService.verify(token);
  }
}
