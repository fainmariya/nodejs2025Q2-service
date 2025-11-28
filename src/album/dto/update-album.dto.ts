// src/album/dto/update-album.dto.ts
import { IsString, IsOptional, IsUUID, IsInt, Min  } from "class-validator";

export class UpdateAlbumDto{
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  year?: number;

  @IsOptional()
  @IsUUID('4')
  artistId?: string | null;

}
  