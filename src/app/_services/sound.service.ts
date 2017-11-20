import { Injectable } from '@angular/core';
import { MapService } from 'services/map.service';

import * as fs from 'fs';

interface IMap {
  soundMap: Map<string, string>;
}

@Injectable()
export class SoundService {
  private map: IMap;

  constructor (mapService: MapService) {
    this.map = mapService;
  }

  public readSndDat(): string {
    let content: string;

    content = fs.readFileSync('src/assets/snd/SoundClips.dat', 'utf8');

    if (content === undefined) {
      throw new Error("File not read");
    }

    return content;
  }
}