// src/auth/auth.service.ts
import {
  Injectable,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { UserService } from '../user/user.service';

type Tokens = { accessToken: string; refreshToken: string };

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwt: JwtService,
  ) {}

  async signup(dto: SignupDto) {
    const { login, password } = dto;

    const existing = await this.userService.findByLogin(login);
    if (existing) {
      throw new ConflictException('User with this login already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    return this.userService.create({
      login,
      password: passwordHash,
    });
  }

  private async signTokens(user: { id: string; login: string }): Promise<Tokens> {
    const payload = { userId: user.id, login: user.login };

    const accessToken = await this.jwt.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '1h',
    });

    const refreshToken = await this.jwt.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    });

    return { accessToken, refreshToken };
  }

  async login(dto: LoginDto): Promise<Tokens> {
    const user = await this.userService.findByLogin(dto.login);
    if (!user) {
      throw new ForbiddenException('Authentication failed');
    }

    const ok = await bcrypt.compare(dto.password, user.password);
    if (!ok) {
      throw new ForbiddenException('Authentication failed');
    }

    return this.signTokens({ id: user.id, login: user.login });
  }

  async refresh(dto: RefreshDto): Promise<Tokens> {
    // Валидацию "есть ли refreshToken" лучше делать на уровне контроллера (см. ниже)
    try {
      const payload = await this.jwt.verifyAsync(dto.refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      // payload содержит userId/login — и это достаточно, чтобы выпустить новую пару
      return this.signTokens({ id: payload.userId, login: payload.login });
    } catch {
      throw new ForbiddenException('Refresh token is invalid or expired');
    }
  }
}
