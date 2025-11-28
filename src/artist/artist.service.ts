import {
    
    Injectable,
    NotFoundException,
} from '@nestjs/common'
import { CreateArtistDto } from './dto/create-artist.dto'
import { UpdateArtistDto } from './dto/update-artist.dto'
import { Artist } from './artist.entity'
import {randomUUID} from 'crypto'
import { TrackService } from '../track/track.service';
import { AlbumService } from '../album/album.service';


@Injectable()
export class ArtistService {
  private artists: Artist[] = [];
  constructor(
    private readonly trackService: TrackService,
    private readonly albumService: AlbumService,
  ) {}
  findAll() {
    return this.artists;
  }

  findOne(id: string) {
    const artist = this.artists.find((a) => a.id === id);
    if (!artist) {
      throw new NotFoundException(`Artist with id ${id} not found`);
    }
    return artist;
  }

  create(dto: CreateArtistDto) {
    const newArtist: Artist = {
      id: randomUUID(),
      name: dto.name,
      grammy: dto.grammy,
    };

    this.artists.push(newArtist);
    return newArtist;
  }

  update(id: string, dto: UpdateArtistDto) {
    const artist = this.artists.find((a) => a.id === id);
    if (!artist) {
      throw new NotFoundException(`Artist with id ${id} not found`);
    }

    if (dto.name !== undefined) {
      artist.name = dto.name;
    }
    if (dto.grammy !== undefined) {
      artist.grammy = dto.grammy;
    }

    return artist;
  }

  remove(id: string) {
    const index = this.artists.findIndex((a) => a.id === id);
    if (index === -1) {
      throw new NotFoundException(`Artist with id ${id} not found`);
    }

    this.trackService.clearArtistId(id);
    this.albumService.clearArtistId(id);

    this.artists.splice(index, 1);
  }
}