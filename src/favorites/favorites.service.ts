import { Injectable, NotFoundException } from '@nestjs/common';
import { Favorites } from './favorites.entity';

@Injectable()
export class FavoritesService {
  private favorites: Favorites = {
    artists: [],
    albums: [],
    tracks: [],
  };

  getAllIds(): Favorites {
    return this.favorites;
  }

  // ------ TRACKS ------

  addTrack(id: string) {
    if (!this.favorites.tracks.includes(id)) {
      this.favorites.tracks.push(id);
    }
  }

  removeTrack(id: string) {
    const index = this.favorites.tracks.indexOf(id);
    if (index === -1) {
      throw new NotFoundException('Track is not in favorites');
    }
    this.favorites.tracks.splice(index, 1);
  }

  // ------ ALBUMS ------

  addAlbum(id: string) {
    if (!this.favorites.albums.includes(id)) {
      this.favorites.albums.push(id);
    }
  }

  removeAlbum(id: string) {
    const index = this.favorites.albums.indexOf(id);
    if (index === -1) {
      throw new NotFoundException('Album is not in favorites');
    }
    this.favorites.albums.splice(index, 1);
  }

  // ------ ARTISTS ------

  addArtist(id: string) {
    if (!this.favorites.artists.includes(id)) {
      this.favorites.artists.push(id);
    }
  }

  removeArtist(id: string) {
    const index = this.favorites.artists.indexOf(id);
    if (index === -1) {
      throw new NotFoundException('Artist is not in favorites');
    }
    this.favorites.artists.splice(index, 1);
  }
}
