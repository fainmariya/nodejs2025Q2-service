// src/user/user.controller.ts
import { Controller, Get, Post, Body, Param , Put, Delete, ParseUUIDPipe, HttpStatus, HttpCode} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Controller('user') 
export class UserController {
  constructor(private readonly userService: UserService) {}

  // GET /user
  @Get() 
  findAll() {
    return this.userService.findAll();
  }

// GET /user/:id
  @Get(':id') 
  findOne(@Param('id', new ParseUUIDPipe) id: string) {
    return this.userService.findOne(id);
  }
// POST /user
  @Post() 
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }
 // PUT /user/:id
@Put(':id')
  updatePassword(
    @Param('id', new ParseUUIDPipe) id: string,
    @Body() dto: UpdatePasswordDto,
  ) {
    return this.userService.updatePassword(id, dto);
  }
  // DELETE /user/:id
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // 204
  remove(@Param('id', new ParseUUIDPipe) id: string) {
    return this.userService.remove(id);
  }
}
