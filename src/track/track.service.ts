import { Injectable, NotFoundException } from '@nestjs/common';
import { Track } from './track.entity';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class TrackService {
  private tracks: Track[] = [];

  // GET /track
  findAll() {
    return this.tracks;
  }

  // GET /track/:id
  findOne(id: string) {
    const track = this.tracks.find((t) => t.id === id);
    if (!track) {
      throw new NotFoundException(`Track with id ${id} not found`);
    }
    return track;
  }

  // POST /track
  create(dto: CreateTrackDto) {
    const newTrack: Track = {
      id: randomUUID(),
      name: dto.name,
      artistId: dto.artistId ?? null,
      albumId: dto.albumId ?? null,
      duration: dto.duration,
    };

    this.tracks.push(newTrack);
    return newTrack;
  }

  // PUT /track/:id
  update(id: string, dto: UpdateTrackDto) {
    const track = this.tracks.find((t) => t.id === id);

    // если трек не найден → 404 (то, что ждёт тест)
    if (!track) {
      throw new NotFoundException(`Track with id ${id} not found`);
    }

    // обновляем только те поля, которые действительно пришли
    if (dto.name !== undefined) {
      track.name = dto.name;
    }

    if (dto.duration !== undefined) {
      track.duration = dto.duration;
    }

    if (dto.artistId !== undefined) {
      track.artistId = dto.artistId;
    }

    if (dto.albumId !== undefined) {
      track.albumId = dto.albumId;
    }

    // возвращаем обновлённый трек → контроллер отдаст 200
    return track;
  }

  // DELETE /track/:id
  remove(id: string) {
    const index = this.tracks.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new NotFoundException(`Track with id ${id} not found`);
    }

    this.tracks.splice(index, 1);
  }

  // используются при удалении артиста / альбома
  clearArtistId(artistId: string) {
    this.tracks.forEach((t) => {
      if (t.artistId === artistId) {
        t.artistId = null;
      }
    });
  }

  clearAlbumId(albumId: string) {
    this.tracks.forEach((t) => {
      if (t.albumId === albumId) {
        t.albumId = null;
      }
    });
  }
}
