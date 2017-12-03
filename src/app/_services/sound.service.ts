import { Injectable } from '@angular/core';
import { AssetType } from 'asset';
import { MapService } from 'services/map.service';

import * as fs from 'fs';
import * as fsx from 'fs-extra';
import * as path from 'path';

@Injectable()
export class SoundService {
  public customSoundMap: Map<string, Map<string, HTMLAudioElement>>; // stores map of custom clips for saving
  public nameToAudio: Map<string, HTMLAudioElement>;  // stores name of the clip to all audio clips
  public soundMap: Map<string, Map<string, HTMLAudioElement>>; // links audio to map of clip names to actual audio

  constructor() {
    this.nameToAudio = new Map();
  }

  /**
   * getter function for customSoundMap variable
   */
  public getCustomSoundMap() {
    return this.customSoundMap;
  }

  /**
   *
   * @param category category of the custom sound
   * @param filepath file path of the sound starting from its category directory (ex. archer/acknowlede1.wav)
   * @param clip HTML audio object of the sound
   * @param deleting boolean value true if deleting from customSoundMap, or false if not
   */
  public updateCustomSoundMap(category, file, clip, deleting) {
    if (deleting) {
      this.customSoundMap.get(category).delete(file);
    } else {
      if (this.customSoundMap.get(category) === undefined) {
        this.customSoundMap.set(category, new Map());
      }
      this.customSoundMap.get(category).set(file, clip);
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
    const allClips = songs + clips;
    const lines = allClips.split(/\r?\n/);

    for (let i = 0; i < lines.length; i += 2) {
      const split = lines[i + 1].split('/');
      const type = split[split.length - 2];
      const file = split[split.length - 1];
      const filepath = path.join('..', 'data', 'snd', type, file);
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
  }

  /**
   * opens the soundclips.dat file for reading
   */
  public readSndDat(): string {
    let content: string;

    content = fs.readFileSync(path.join('data', 'snd', 'SoundClips.dat'), 'utf8');

    if (content === undefined) {
      throw new Error('File not read');
    }

    return content;
  }

  /**
   * if the custom sound exists, then load it into the soundmap instead of the default
   * @param filepath file path of current sound
   */
  public checkForCustomSound(filepath: string): string {
    const split = filepath.split(path.sep);
    const category = split[split.length - 2];
    const file = split[split.length - 1];
    const customFilePath = path.join('..', 'data', 'customSnd', category, file);
    try {
      fs.accessSync(path.join('data', customFilePath));
      const deleting = false;
      this.updateCustomSoundMap(category, file, new Audio(customFilePath), deleting);
      return customFilePath;
    } catch (e) {
      return filepath;
    }
  }

  /**
   * copies sound clip to custom sound of drop down menu by renaming it and saying to customSnd folder
   * @param src source file path
   * @param dest destination file path
   * @param category category of sound
   * @param sound clip name
   * @param clip audio clip
   */
  public copyFile(src, dest, category, sound, clip) {
    try {
      fs.accessSync(path.join('data', 'customSnd', category));
    } catch (e) {
      fsx.emptyDirSync(path.join('data', 'customSnd', category));
    }
    const readStream = fs.createReadStream(src);

    readStream.once('error', (err) => {
      console.log(err);
    });
    console.log(dest);
    readStream.pipe(fs.createWriteStream(dest)).on('finish', () => {
      const deleting = false;
      this.editSoundMap(category, sound, clip);
      const split = dest.split('/');
      const file = split[split.length - 1];
      this.updateCustomSoundMap(category, file, clip, deleting);
    });
  }

  /**
   * updates soundmap when audio is changed
   * @param category category of sound
   * @param sound clip name
   * @param clip audio clip
   */
  public editSoundMap(category, sound, clip) {
    this.soundMap.get(category).set(sound, clip);

    const player = document.getElementById('audio-player') as HTMLAudioElement;
    player.src = clip.src;

  }

  /**
   * deletes custom sound
   * @param tbd custom audio to be deleted
   */
  public deleteSound(tbd: string) {
    fs.unlink(tbd, function() { console.log('deleted'); });
  }

  /**
   * interface used for playing audio for animation
   * @param clipName clip name of audio for desired action
   */
  public getAssetSound(clipName: string) {
    return this.nameToAudio.get(clipName);
  }
}
