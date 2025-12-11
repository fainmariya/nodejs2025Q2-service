import { Injectable, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { SignupDto } from './dto/signup.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async signup(dto: SignupDto) {
    const { login, password } = dto;

    const existing = await this.userService.findByLogin(login);
    if (existing) {
  
      throw new ConflictException('User with this login already exists');
    }


    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

   
    const user = await this.userService.create({
      login,
      password: passwordHash,
    });

    
    return user;
  }
}
