// src/album/album.module.ts
import { Module } from '@nestjs/common';
import { AlbumController } from './album.controller';
import { AlbumService } from './album.service';
import { TrackModule } from '../track/track.module';

@Module({
  imports: [TrackModule],
  controllers: [AlbumController],
  providers: [AlbumService],
  exports: [AlbumService], // чтобы Artist/Favorites могли использовать AlbumService
})
export class AlbumModule {}