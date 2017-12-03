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
  public updateCustomSoundMap(category, filepath, clip, deleting) {
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
    const allClips = songs + clips;
    const lines = allClips.split(/\r?\n/);

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
  }

  /**
   * opens the soundclips.dat file for reading
   */
  public readSndDat(): string {
    let content: string;

    content = fs.readFileSync('data/snd/SoundClips.dat', 'utf8');

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
    const [, , , category, file] = filepath.split('/');
    const customFilePath = '../data/customSnd/' + category + '/' + file;
    try {
      fs.accessSync('data/' + customFilePath);
      const deleting = false;
      this.updateCustomSoundMap(category, path.join(category, file), new Audio(customFilePath), deleting);
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
  public async copyFile(src, dest, category, sound, clip) {
    try {
      fs.accessSync(path.join('data/customSnd', category));
    } catch (e) {
      await fsx.emptyDir(path.join('data/customSnd', category));
    }
    const readStream = fs.createReadStream(src);

    readStream.once('error', (err) => {
      console.log(err);
    });

    readStream.pipe(fs.createWriteStream(dest)).on('finish', () => {
      const deleting = false;
      this.editSoundMap(category, sound, clip);
      const split = dest.split('/');
      const file = split[split.length - 1];
      const filepath = path.join(category, file);
      this.updateCustomSoundMap(category, filepath, clip, deleting);
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

    // this.soundUpdated.next(undefined);
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
