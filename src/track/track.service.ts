import { Injectable, NotFoundException } from '@nestjs/common';

import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';

import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TrackService {
  constructor(private readonly prisma: PrismaService) {}

  // GET /track
  async findAll() {
    return this.prisma.track.findMany({
      include: {
        artist: true,
        album: true,
      },
    });
  }

  // GET /track/:id
  async findOne(id: string) {
    const track = await this.prisma.track.findUnique({
      where: { id },
      include: {
        artist: true,
        album: true,
      },
    });
    if (!track) {
      throw new NotFoundException(`Track with id ${id} not found`);
    }
    return track;
  }

  // POST /track
  async create(dto: CreateTrackDto) {
    return this.prisma.track.create({
      data: {
        name: dto.name,
        artistId: dto.artistId ?? null,
        albumId: dto.albumId ?? null,
        duration: dto.duration,
      },
    });
  }

  // PUT /track/:id
  async update(id: string, dto: UpdateTrackDto) {
    await this.findOne(id);

    return this.prisma.track.update({
      where: { id },
      data: {
        name: dto.name,
        duration: dto.duration,

        artistId: dto.artistId !== undefined ? dto.artistId : undefined,
        albumId: dto.albumId !== undefined ? dto.albumId : undefined,
      },
    });
  }

  async remove(id: string) {
    try {
      await this.prisma.track.delete({
        where: { id },
      });
    } catch (e: any) {
      if (e.code === 'P2025') {
        throw new NotFoundException(`Traack with id ${id} not found`);
      }
      throw e;
    }
  }
}
