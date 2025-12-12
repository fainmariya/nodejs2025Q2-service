import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { User } from '@prisma/client'; // <-- добавили тип User из Prisma
import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

// Какой формат пользователя мы хотим отдавать наружу
type PublicUser = {
  id: string;
  login: string;
  version: number;
  createdAt: number; // таймстамп
  updatedAt: number; // таймстамп
};

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  // mapper: из Prisma User -> к тому виду, который ожидают тесты
  private toPublicUser(user: User): PublicUser {
    return {
      id: user.id,
      login: user.login,
      version: user.version,
      createdAt: user.createdAt.getTime(), // Date -> number
      updatedAt: user.updatedAt.getTime(), // Date -> number
    };
  }

  // GET /user
  async findAll() {
    const users = await this.prisma.user.findMany();
    return users.map((u) => this.toPublicUser(u));
  }

  // GET /user/:id
  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return this.toPublicUser(user);
  }

  // Для auth: поиск по логину
  async findByLogin(login: string) {
    return this.prisma.user.findUnique({ where: { login } });
  }

  // POST /user
  async create(dto: CreateUserDto) {
    try {
      const passwordHash = await bcrypt.hash(dto.password, 10);

      const user = await this.prisma.user.create({
        data: { login: dto.login, password: passwordHash, version: 1 },
      });
      return this.toPublicUser(user);
    } catch (e: any) {
      if (e.code === 'P2002') {
        throw new ConflictException('Login already exists');
      }
      throw e;
    }
  }

  // PUT /user/:id
  async updatePassword(id: string, dto: UpdatePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    const ok = await bcrypt.compare(dto.oldPassword, user.password);
  if (!ok) {
    throw new ForbiddenException('Old password is wrong');
  }
  const newHash = await bcrypt.hash(dto.newPassword, 10);
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        password: newHash,
        version: { increment: 1 },
      },
    });

    return this.toPublicUser(updatedUser);
  }

  // DELETE /user/:id
  async remove(id: string) {
    try {
      await this.prisma.user.delete({ where: { id } });
    } catch (e: any) {
      if (e.code === 'P2025') {
        throw new NotFoundException(`User with id ${id} not found`);
      }
      throw e;
    }
  }
}
