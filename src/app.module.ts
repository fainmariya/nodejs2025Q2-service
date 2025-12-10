import { Module, 
         MiddlewareConsumer, 
         NestModule,
         ValidationPipe } 
         from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';

import { UserModule } from './user/user.module';
import { ArtistModule } from './artist/artist.module';
import { TrackModule } from './track/track.module';
import { AlbumModule } from './album/album.module';
import { FavoritesModule } from './favorites/favorites.module';
import { PrismaModule } from './prisma/prisma.module';
import { LoggingModule } from './common/loggin/logging.module';
import { LoggingMiddleware } from './common/loggin/logging.middleware';
import { AppController } from './app.controller';

@Module({
  imports: [
    LoggingModule,
    PrismaModule,
    UserModule,
    ArtistModule,
    TrackModule,
    AlbumModule,
    FavoritesModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_PIPE,
      useFactory: () =>
        new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: true,
          transform: true,
        }),
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
