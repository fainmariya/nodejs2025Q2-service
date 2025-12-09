import { NotFoundException, Injectable } from '@nestjs/common';
import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AlbumService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.album.findMany({
      include: {
        artist: true,
        tracks: true,
      },
    });
  }

  async findOne(id: string) {
    const album = this.prisma.album.findUnique({
      where: { id },
      include: {
        artist: true,
        tracks: true,
      },
    });
    if (!album) {
      throw new NotFoundException(`Album with id ${id} not found`);
    }
    return album;
  }

  async create(dto: CreateAlbumDto) {
    return this.prisma.album.create({
      data: {
        name: dto.name,
        year: dto.year,
        artistId: dto.artistId ?? null,
      },
    });
  }

  async update(id: string, dto: UpdateAlbumDto) {
    await this.findOne(id);

    return this.prisma.album.update({
      where: { id },
      data: {
        name: dto.name,
        year: dto.year,
        artistId: dto.artistId !== undefined ? dto.artistId : undefined,
      },
    });
  }
  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.album.delete({
      where: { id },
    });
  }
}
