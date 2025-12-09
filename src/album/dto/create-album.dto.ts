import { IsString, IsOptional, IsUUID, IsInt, Min } from 'class-validator';

export class CreateAlbumDto {
  @IsString()
  name: string;

  @IsInt()
  @Min(0)
  year: number;

  @IsOptional()
  @IsUUID('4')
  artistId: string | null;
}
