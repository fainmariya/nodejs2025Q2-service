// src/auth/auth.service.ts

import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

import { UserService } from '../user/user.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';

type Tokens = {
  accessToken: string;
  refreshToken: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(dto: SignupDto) {
    const { login, password } = dto;

    const existing = await this.userService.findByLogin(login);
    if (existing) {
      throw new ConflictException('User with this login already exists');
    }

    // Важно: хеширование сейчас делается в UserService.create()
    return this.userService.create({ login, password });
  }

  private async signTokens(userId: string, login: string): Promise<Tokens> {
    const payload = { userId, login };

    const accessSecret = process.env.JWT_ACCESS_SECRET;
    const refreshSecret = process.env.JWT_REFRESH_SECRET;

    // Это не "ошибка клиента", это "ошибка конфигурации сервера"
    if (!accessSecret || !refreshSecret) {
      throw new Error('JWT secrets are not configured');
    }

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: accessSecret,
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '60s',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: refreshSecret,
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
    });

    return { accessToken, refreshToken };
  }

  async login(dto: LoginDto): Promise<Tokens> {
    const user = await this.userService.findByLogin(dto.login);
    if (!user) {
      throw new ForbiddenException('Authentication failed');
    }

    // user.password здесь — хеш из БД
    const ok = await bcrypt.compare(dto.password, user.password);
    if (!ok) {
      throw new ForbiddenException('Authentication failed');
    }

    return this.signTokens(user.id, user.login);
  }

  async refresh(dto: RefreshDto): Promise<Tokens> {
    // По ТЗ: если refreshToken отсутствует -> 401
    if (!dto.refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    try {
      const payload = await this.jwtService.verifyAsync(dto.refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      return this.signTokens(payload.userId, payload.login);
    } catch {
      // По ТЗ: если refreshToken невалидный/протух -> 403
      throw new ForbiddenException('Refresh token is invalid or expired');
    }
  }
}
