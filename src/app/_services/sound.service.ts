import { Injectable } from '@angular/core';
import { AssetType } from 'asset';
import { ReplaySubject } from 'rxjs';
import { MapService } from 'services/map.service';
import { AssetTypeToClips } from 'sound';

import * as fs from 'fs';

interface IMap {
  soundMap: Map<string, Map<string, string>>;
}

@Injectable()
export class SoundService {
  private map: IMap;
  public nameToAudio: Map<string, HTMLAudioElement>;

  public soundUpdated = new ReplaySubject<void>(1);

  constructor(mapService: MapService) {
    this.map = mapService;
    this.nameToAudio = new Map();
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
    console.log('src: ' + src);
    console.log('dest: ' + dest);

    readStream.once('error', (err) => {
      console.log(err);
    });

    readStream.once('end', () => {
      // this.soundUpdated.next(undefined);
    });
    const writeStream = fs.createWriteStream(dest);

    writeStream.on('finish', () => {
      console.log('write end');
    });
    readStream.pipe(writeStream).on('finish', () => {
      // document.getElementById('soundplayers').innerHTML = '';
      // console.log('set to empty');
      document.getElementById('soundplayers').innerHTML = '<audio id="audio-player" controls="controls" src="../' + dest + '" type="audio/wav">';

      console.log('done copying');
    });
  }

  public editSoundMap(category: string, sound: string, dest: string) {
    console.log('editSound');
    this.map.soundMap.get(category).set(sound, dest);
    // this.soundUpdated.next(undefined);
  }

  public deleteSound(tbd: string) {
    fs.unlink(tbd, function() { console.log('deleted'); });
  }


  public getAudioForAssetType(asset: AssetType){
    const clipNames = AssetTypeToClips.get(asset);
    const clipNameToAudio = new Map<string, HTMLAudioElement>();

    for (const clipName of clipNames) {
      const audio = this.nameToAudio.get(clipName);
      clipNameToAudio.set(clipName, audio);
    }

    return clipNameToAudio;
  }
}
