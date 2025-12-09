import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  // helper: убираем поле password
  private removePassword<T extends { password?: string }>(
    user: T,
  ): Omit<T, 'password'> {
    const { password, ...rest } = user;
    return rest;
  }

  // GET /user
  async findAll() {
    const users = await this.prisma.user.findMany();
    return users.map((u) => this.removePassword(u));
  }

  // GET /user/:id
  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return this.removePassword(user);
  }

  // POST /user
  async create(dto: CreateUserDto) {
    const user = await this.prisma.user.create({
      data: {
        login: dto.login,
        password: dto.password,
        // version, createdAt, updatedAt:
        // createdAt → @default(now())
        // updatedAt → @updatedAt

        version: 1,
      },
    });

    return this.removePassword(user);
  }

  // PUT /user/:id
  async updatePassword(id: string, dto: UpdatePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    if (user.password !== dto.oldPassword) {
      throw new ForbiddenException('Old password is wrong');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        password: dto.newPassword,

        version: { increment: 1 },
      },
    });

    return this.removePassword(updatedUser);
  }

  // DELETE /user/:id
  async remove(id: string) {
    try {
      await this.prisma.user.delete({ where: { id } });
    } catch (e: any) {
      // если пользователя нет — Prisma кидает ошибку P2025
      if (e.code === 'P2025') {
        throw new NotFoundException(`User with id ${id} not found`);
      }
      throw e;
    }
  }
}
