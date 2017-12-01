import { Injectable } from '@angular/core';
import { AssetType } from 'asset';
import { AssetTypeToClips } from 'sound';

import * as fs from 'fs';

@Injectable()
export class SoundService {
  public nameToAudio: Map<string, HTMLAudioElement>;
  public soundMap: Map<string, Map<string, HTMLAudioElement>>;

  constructor() {
    this.soundMap = new Map();
    this.nameToAudio = new Map();
  }

  /**
 * Reads the SoundClips dat file and populates the map's soundMap.
 */
  public parseSndData() {
    const sndData = this.readSndDat().trim();
    const [, sampleRate, songCount, songs, clipCount, clips] = sndData.split(/#.*?\r?\n/);
    const lines = clips.split(/\r?\n/);

    for (let i = 0; i < lines.length; i += 2) {
      const [, type, file] = lines[i + 1].split('/');
      const filepath = '../dist/assets/snd/' + type + '/' + file;
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
  public copyFile(src, dest, category, sound, clip) {
    const readStream = fs.createReadStream(src);
    console.log('src: ' + src);
    console.log('dest: ' + dest);

    readStream.once('error', (err) => {
      console.log(err);
    });

    readStream.pipe(fs.createWriteStream(dest)).on('finish', () => {
      this.editSoundMap(category, sound, clip);
      // document.getElementById('soundplayers').innerHTML = '<audio id="audio-player" controls="controls" src="../' + clip.src + '" type="audio/wav">';
      console.log('done copying');
    });
  }

  public editSoundMap(category, sound, clip) {
    console.log('editSound');
    this.soundMap.get(category).set(sound, clip);
    const newsnd = this.soundMap.get(category).get(sound);
    document.getElementById('soundplayers').innerHTML = '<audio id="audio-player" controls="controls" src="' + newsnd.src + '" type="audio/wav">';

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
