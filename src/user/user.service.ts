import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Injectable()
export class UserService {
  private users: User[] = [];

  // helper: возвращает пользователя без поля password
  private removePassword(user: User) {
    const { password, ...rest } = user;

    void password;
    return rest;
  }

  // GET /user
  findAll() {
    return this.users.map((u) => this.removePassword(u));
  }

  // GET /user/:id
  findOne(id: string) {
    const user = this.users.find((u) => u.id === id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return this.removePassword(user);
  }

  // POST /user
  create(dto: CreateUserDto) {
    const now = Date.now();

    const newUser: User = {
      id: randomUUID(),
      login: dto.login,
      password: dto.password,
      version: 1,
      createdAt: now,
      updatedAt: now,
    };

    this.users.push(newUser);

    return this.removePassword(newUser);
  }

  // PUT /user/:id
  updatePassword(id: string, dto: UpdatePasswordDto) {
    const user = this.users.find((u) => u.id === id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    if (user.password !== dto.oldPassword) {
      throw new ForbiddenException('Old password is wrong');
    }

    user.password = dto.newPassword;
    user.version += 1;
    user.updatedAt = Date.now();

    return this.removePassword(user);
  }

  // DELETE /user/:id
  remove(id: string) {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    this.users.splice(index, 1);
  }
}
