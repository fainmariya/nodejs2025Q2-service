// src/track/track.controller.ts
import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseUUIDPipe,
    Post,
    Put,
  } from '@nestjs/common';
  import { TrackService } from './track.service';
  import { CreateTrackDto } from './dto/create-track.dto';
  import { UpdateTrackDto } from './dto/update-track.dto';
  
  @Controller('track')
export class TrackController {
  constructor(private readonly trackService: TrackService) {}

  // GET /track
  @Get()
  findAll() {
    return this.trackService.findAll();
  }

  // GET /track/:id
  @Get(':id')
  findOne(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.trackService.findOne(id);
  }

  // POST /track
  @Post()
  @HttpCode(HttpStatus.CREATED) // 201
  create(@Body() dto: CreateTrackDto) {
    return this.trackService.create(dto);
  }

  // PUT /track/:id
  @Put(':id')
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateTrackDto,
  ) {
    return this.trackService.update(id, dto);
  }

  // DELETE /track/:id
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // 204
  remove(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    this.trackService.remove(id);
  }
}