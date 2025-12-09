// src/favorites/favorites.service.ts
import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  // GET /favs
  async findAll() {
    const [favArtists, favAlbums, favTracks] = await Promise.all([
      this.prisma.favoriteArtist.findMany({ include: { artist: true } }),
      this.prisma.favoriteAlbum.findMany({ include: { album: true } }),
      this.prisma.favoriteTrack.findMany({ include: { track: true } }),
    ]);

    return {
      artists: favArtists.map((fa) => fa.artist),
      albums: favAlbums.map((fa) => fa.album),
      tracks: favTracks.map((ft) => ft.track),
    };
  }

  // ------- TRACKS --------

  async addTrack(trackId: string) {
    const track = await this.prisma.track.findUnique({
      where: { id: trackId },
    });
    if (!track) {
      // для добавления несуществующей сущности — 422
      throw new UnprocessableEntityException(
        `Track with id ${trackId} does not exist`,
      );
    }

    try {
      await this.prisma.favoriteTrack.create({
        data: { trackId },
      });
    } catch (e: any) {
      // P2002 — попытка добавить дубликат (ignore)
      if (e.code !== 'P2002') {
        throw e;
      }
    }
  }

  async removeTrack(trackId: string) {
    try {
      await this.prisma.favoriteTrack.delete({
        where: { trackId },
      });
    } catch (e: any) {
      if (e.code === 'P2025') {
        // сущность не была в избранном — 404
        throw new NotFoundException(
          `Track with id ${trackId} is not in favorites`,
        );
      }
      throw e;
    }
  }

  // ------- ALBUMS --------

  async addAlbum(albumId: string) {
    const album = await this.prisma.album.findUnique({
      where: { id: albumId },
    });
    if (!album) {
      throw new UnprocessableEntityException(
        `Album with id ${albumId} does not exist`,
      );
    }

    try {
      await this.prisma.favoriteAlbum.create({
        data: { albumId },
      });
    } catch (e: any) {
      if (e.code !== 'P2002') {
        throw e;
      }
    }
  }

  async removeAlbum(albumId: string) {
    try {
      await this.prisma.favoriteAlbum.delete({
        where: { albumId },
      });
    } catch (e: any) {
      if (e.code === 'P2025') {
        throw new NotFoundException(
          `Album with id ${albumId} is not in favorites`,
        );
      }
      throw e;
    }
  }

  // ------- ARTISTS --------

  async addArtist(artistId: string) {
    const artist = await this.prisma.artist.findUnique({
      where: { id: artistId },
    });
    if (!artist) {
      throw new UnprocessableEntityException(
        `Artist with id ${artistId} does not exist`,
      );
    }

    try {
      await this.prisma.favoriteArtist.create({
        data: { artistId },
      });
    } catch (e: any) {
      if (e.code !== 'P2002') {
        throw e;
      }
    }
  }

  async removeArtist(artistId: string) {
    try {
      await this.prisma.favoriteArtist.delete({
        where: { artistId },
      });
    } catch (e: any) {
      if (e.code === 'P2025') {
        throw new NotFoundException(
          `Artist with id ${artistId} is not in favorites`,
        );
      }
      throw e;
    }
  }
}
