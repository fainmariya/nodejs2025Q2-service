import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ArtistService {
  constructor(private readonly prisma: PrismaService) {}
  async findAll() {
    return this.prisma.artist.findMany();
  }

  async findOne(id: string) {
    const artist = await this.prisma.artist.findUnique({ where: { id } });
    if (!artist) {
      throw new NotFoundException(`Artist with id ${id} not found`);
    }
    return artist;
  }

  async create(dto: CreateArtistDto) {
    return this.prisma.artist.create({
      data: {
        name: dto.name,
        grammy: dto.grammy,
      },
    });
  }

  async update(id: string, dto: UpdateArtistDto) {
    await this.findOne(id);

    return this.prisma.artist.update({
      where: { id },
      data: {
        name: dto.name,
        grammy: dto.grammy,
      },
    });
  }

  async remove(id: string) {
    try {
      await this.prisma.artist.delete({
        where: { id },
      });
    } catch (e: any) {
      if (e.code === 'P2025') {
        throw new NotFoundException(`Artist with id ${id} not found`);
      }
      throw e;
    }
  }
  
}
