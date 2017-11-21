import { Injectable } from '@angular/core';
import { MapService } from 'services/map.service';

import * as fs from 'fs';

interface IMap {
  soundMap: Map<string, Map<string, string>>;
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
      throw new Error('File not read');
    }

    return content;
  }

  public checkForCustomSound(filepath: string): string {
    const [, , , type, file] = filepath.split('/');
    const customFilePath = 'src/assets/customSnd/' + type + '/' + file;

    try {
      fs.accessSync(customFilePath);
      return customFilePath;
    } catch (e) {
      return filepath;
    }
  }

 // stolen from https://stackoverflow.com/questions/38595524/copy-a-source-file-to-another-destination-in-nodejs
  public copyFile(src, dest) {
      const readStream = fs.createReadStream(src);

      readStream.once('error', (err) => {
        console.log(err);
      });

      readStream.once('end', () => {
        console.log('done copying');
      });

      readStream.pipe(fs.createWriteStream(dest));
    }
}
