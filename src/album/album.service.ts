import { NotFoundException, Injectable } from "@nestjs/common";
import { CreateAlbumDto } from "./dto/create-album.dto";
import { UpdateAlbumDto } from "./dto/update-album.dto";
import { Album } from "./album.entity";
import { randomUUID } from "crypto";
import { TrackService } from '../track/track.service';


@Injectable()
export class AlbumService{
    private albums: Album[]=[];
    constructor(private readonly trackService: TrackService) {}

    findAll(){
        return this.albums;
    }

    findOne(id:string){
const album = this.albums.find((a)=>a.id === id);
if (!album){
    throw new NotFoundException(`Album with id ${id} not found`)
}
return album;
    }

    create(dto:CreateAlbumDto){
        const newAlbum: Album={
            id: randomUUID(),
            name: dto.name,
            year: dto.year,
            artistId: dto.artistId?? null,
        };
        this.albums.push(newAlbum);
        return newAlbum
    };

    update(id:string, dto:UpdateAlbumDto){
        const album = this.albums.find((a)=>a.id===id);
    if(!album){
        throw new NotFoundException(`Album with id ${id} not found`)
    }  
    if (dto.name !== undefined) {
        album.name = dto.name;
      }
      if (dto.year !== undefined) {
        album.year = dto.year;
      }
      if (dto.artistId !== undefined) {
        album.artistId = dto.artistId;
      }
  
      return album;
    }
    remove(id: string) {
        const index = this.albums.findIndex((a) => a.id === id);
        if (index === -1) {
          throw new NotFoundException(`Album with id ${id} not found`);
        }
    
        
        this.trackService.clearAlbumId(id);
    
        this.albums.splice(index, 1);
      }
    
      
      clearArtistId(artistId: string) {
        this.albums.forEach((a) => {
          if (a.artistId === artistId) {
            a.artistId = null;
          }
        });
      }
    
}
