import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UnprocessableEntityException,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { ArtistService } from '../artist/artist.service';
import { AlbumService } from '../album/album.service';
import { TrackService } from '../track/track.service';

@Controller('favs')
export class FavoritesController {
  constructor(
    private readonly favoritesService: FavoritesService,
    private readonly artistService: ArtistService,
    private readonly albumService: AlbumService,
    private readonly trackService: TrackService,
  ) {}

  // GET /favs
  // должен вернуть объекты сущностей, а не id
  @Get()
  getAll() {
    const ids = this.favoritesService.getAllIds();

    const artists = ids.artists
      .map((id) => {
        try {
          return this.artistService.findOne(id);
        } catch {
          return null;
        }
      })
      .filter((a) => a !== null);

    const albums = ids.albums
      .map((id) => {
        try {
          return this.albumService.findOne(id);
        } catch {
          return null;
        }
      })
      .filter((a) => a !== null);

    const tracks = ids.tracks
      .map((id) => {
        try {
          return this.trackService.findOne(id);
        } catch {
          return null;
        }
      })
      .filter((t) => t !== null);

    return { artists, albums, tracks };
  }

  // ------ TRACKS ------

  @Post('track/:id')
  @HttpCode(HttpStatus.CREATED) // 201
  addTrack(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    try {
      this.trackService.findOne(id); // 404 если нет
    } catch {
      // сущность не существует -> 422
      throw new UnprocessableEntityException(
        `Track with id ${id} does not exist`,
      );
    }

    this.favoritesService.addTrack(id);
  }

  @Delete('track/:id')
  @HttpCode(HttpStatus.NO_CONTENT) // 204
  removeTrack(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    this.favoritesService.removeTrack(id);
  }

  // ------ ALBUMS ------

  @Post('album/:id')
  @HttpCode(HttpStatus.CREATED)
  addAlbum(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    try {
      this.albumService.findOne(id);
    } catch {
      throw new UnprocessableEntityException(
        `Album with id ${id} does not exist`,
      );
    }

    this.favoritesService.addAlbum(id);
  }

  @Delete('album/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeAlbum(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    this.favoritesService.removeAlbum(id);
  }

  // ------ ARTISTS ------

  @Post('artist/:id')
  @HttpCode(HttpStatus.CREATED)
  addArtist(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    try {
      this.artistService.findOne(id);
    } catch {
      throw new UnprocessableEntityException(
        `Artist with id ${id} does not exist`,
      );
    }

    this.favoritesService.addArtist(id);
  }

  @Delete('artist/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeArtist(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    this.favoritesService.removeArtist(id);
  }
}
