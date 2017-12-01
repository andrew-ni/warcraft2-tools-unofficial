import { Injectable } from '@angular/core';
import { AssetType } from 'asset';
import { MapService } from 'services/map.service';
import { AssetTypeToClips } from 'sound';

import * as fs from 'fs';

@Injectable()
export class SoundService {
  public nameToAudio: Map<string, HTMLAudioElement>;
  public soundMap: Map<string, Map<string, HTMLAudioElement>>;

  constructor() {
    this.nameToAudio = new Map();
  }

  /**
 * Reads the SoundClips dat file and populates the map's soundMap.
 */
  public parseSndData() {
    this.soundMap = new Map();
    const sndData = this.readSndDat().trim();
    const [, sampleRate, songCount, songs, clipCount, clips] = sndData.split(/#.*?\r?\n/);
    const lines = clips.split(/\r?\n/);

    for (let i = 0; i < lines.length; i += 2) {
      const [, type, file] = lines[i + 1].split('/');
      const filepath = '../data/snd/' + type + '/' + file;
      const checkedPath = this.checkForCustomSound(filepath);
      const checkedAudio = new Audio(checkedPath);
      if (this.soundMap.has(type)) {
        this.soundMap.get(type).set(lines[i], checkedAudio);
      } else {
        const fileToAudio: Map<string, HTMLAudioElement> = new Map;
        fileToAudio.set(lines[i], checkedAudio);
        this.soundMap.set(type, fileToAudio);
      }
      this.nameToAudio.set(lines[i], checkedAudio);
    }
    console.log(this.soundMap);
  }

  public readSndDat(): string {
    let content: string;

    content = fs.readFileSync('data/snd/SoundClips.dat', 'utf8');

    if (content === undefined) {
      throw new Error('File not read');
    }

    return content;
  }

  public checkForCustomSound(filepath: string): string {
    const [, , , type, file] = filepath.split('/');
    const customFilePath = 'dist/../data/customSnd/' + type + '/' + file;
    try {
      fs.accessSync(customFilePath);
      console.log(customFilePath);
      return '../' + customFilePath;
    } catch (e) {
      return filepath;
    }
  }

  public copyFile(src, dest, category, sound, clip) {
    const readStream = fs.createReadStream(src);

    readStream.once('error', (err) => {
      console.log(err);
    });

    readStream.pipe(fs.createWriteStream(dest)).on('finish', () => {
      this.editSoundMap(category, sound, clip);
    });
  }

  public editSoundMap(category, sound, clip) {
    this.soundMap.get(category).set(sound, clip);
    const newsnd = this.soundMap.get(category).get(sound);

    const player = document.getElementById('audio-player') as HTMLAudioElement;
    player.src = newsnd.src;

  }

  public deleteSound(tbd: string) {
    fs.unlink(tbd, function() { console.log('deleted'); });
  }


  public getAudioForAssetType(asset: AssetType) {
    const clipNames = AssetTypeToClips.get(asset);
    const clipNameToAudio = new Map<string, HTMLAudioElement>();

    for (const clipName of clipNames) {
      const audio = this.nameToAudio.get(clipName);
      clipNameToAudio.set(clipName, audio);
    }

    return clipNameToAudio;
  }
}
