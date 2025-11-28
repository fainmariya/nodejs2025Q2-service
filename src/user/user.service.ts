// src/user/user.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { User } from './user.entity';
import { randomUUID } from 'crypto';


@Injectable()
export class UserService {
private users: User[] = []; 
// GET /user
  findAll() {
    return this.users.map(({ password, ...safeUser }) => safeUser);
  }
  // GET /user/:id
  findOne(id:string){
    const user = this.users.find((u) => u.id === id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
  }
  const { password, ...safeUser } = user;
    return safeUser;
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

    const { password, ...safeUser } = newUser;
    return safeUser;
  }

  // PUT /user/:id
  updatePassword(id: string, dto: UpdatePasswordDto) {
    const user = this.users.find((u) => u.id === id);
    if (!user) {
      
      throw new NotFoundException(`User with id ${id} not found`);
    }

    if (user.password !== dto.oldPassword) {
      
      throw new ForbiddenException('Old password is incorrect');
    }
    user.password = dto.newPassword;
    user.version += 1;
    user.updatedAt = Date.now();

    const { password, ...safeUser } = user;
    return safeUser;
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
