import { Injectable } from '@angular/core';
import { AssetType } from 'asset';
import { MapService } from 'services/map.service';
import { AssetTypeToClips } from 'sound';

import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SoundService {
  public nameToAudio: Map<string, HTMLAudioElement>;
  public soundMap: Map<string, Map<string, HTMLAudioElement>>;
  public customSoundMap: Map<string, Map<string, HTMLAudioElement>>;

  constructor() {
    this.nameToAudio = new Map();
  }

  public getSoundsForSave() {
    return this.customSoundMap;
  }

  private updateCustomSoundMap(category, filepath, clip, deleting) {
    if (deleting) {
      this.customSoundMap.get(category).delete(filepath);
    } else {
      if (this.customSoundMap.get(category) === undefined) {
        this.customSoundMap.set(category, new Map());
      }
      this.customSoundMap.get(category).set(filepath, clip);
    }
  }

  /**
 * Reads the SoundClips dat file and populates the map's soundMap.
 */
  public parseSndData() {
    this.soundMap = new Map();
    this.customSoundMap = new Map();
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
    const [, , , category, file] = filepath.split('/');
    const customFilePath = '../data/customSnd/' + category + '/' + file;
    console.log(customFilePath);
    try {
      fs.accessSync(customFilePath);
      const deleting = false;
      this.updateCustomSoundMap(category, filepath, new Audio(customFilePath), deleting);
      console.log(customFilePath);
      return customFilePath;
    } catch (e) {
      return filepath;
    }
  }

  // stolen from https://stackoverflow.com/questions/38595524/copy-a-source-file-to-another-destination-in-nodejs
  public copyFile(src, dest, category, sound, clip) {
    const readStream = fs.createReadStream(src);

    readStream.once('error', (err) => {
      console.log(err);
    });

    readStream.pipe(fs.createWriteStream(dest)).on('finish', () => {
      const deleting = false;
      this.editSoundMap(category, sound, clip, deleting);
      // document.getElementById('soundplayers').innerHTML = '<audio id="audio-player" controls="controls" src="../' + clip.src + '" type="audio/wav">';
    });
  }

  public editSoundMap(category, sound, clip, deleting) {
    this.soundMap.get(category).set(sound, clip);
    const newsnd = this.soundMap.get(category).get(sound);
    document.getElementById('soundplayers').innerHTML = '<audio id="audio-player" controls="controls" src="' + newsnd.src + '" type="audio/wav">';

    const split = clip.src.split('/');
    const file = split[split.length - 1];
    const filepath = path.join(category, file);
    this.updateCustomSoundMap(category, filepath, clip, deleting);

    console.log(this.customSoundMap);
    // this.soundUpdated.next(undefined);
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
