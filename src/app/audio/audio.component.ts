import { Component, OnInit } from '@angular/core';
import { Menu } from 'electron';
import { MapService } from 'services/map.service';
import { SerializeService } from 'services/serialize.service';
import { SoundService } from 'services/sound.service';

import * as fsx from 'fs-extra';
import * as path from 'path';

const { dialog } = require('electron').remote;


const options = {
  filters: [
    { name: 'Audio File (.wav)', extensions: ['wav', 'mp3'] }
  ]
};

@Component({
  selector: 'app-audio',
  templateUrl: './audio.component.html',
  styleUrls: ['./audio.component.scss']
})
export class AudioComponent implements OnInit {

  SongCategories = [];
  Sounds: string[] = [];
  isSoundLoaded: Boolean = false;
  selectedClip: HTMLAudioElement;
  selectedCategory: string;
  selectedClipName: string;
  destPath: string;


  constructor(
    private soundService: SoundService,
    private mapService: MapService,
  ) {
  }

  /**
   * initializes context, and subscribes to projectLoaded and soundLoaded events.
   */
  ngOnInit() {
    this.resetSoundContext();
    fsx.removeSync('data/customSnd');
    fsx.emptyDirSync('data/customSnd');
    // parse the soundclips.dat
    this.soundService.parseSndData();
    this.SongCategories = [...this.soundService.soundMap.keys()];

    this.mapService.mapProjectLoaded.do(() => console.log('mapProjectLoaded')).subscribe({
      next: async () => {
        this.soundService.parseSndData();
        fsx.removeSync('data/customSnd');
        fsx.emptyDirSync('data/customSnd');
        const player = document.getElementById('audio-player') as HTMLAudioElement;
        player.src = '';
        this.resetSoundContext();
        this.SongCategories = [...this.soundService.soundMap.keys()];
        this.selectedCategory = this.SongCategories[0];
      },
      error: err => console.error(err),
      complete: null
    });

    this.mapService.customSndLoaded.do(() => console.log('customSndLoaded')).subscribe({
      next: async () => {
        this.soundService.parseSndData();
        this.SongCategories = [...this.soundService.soundMap.keys()];
      },
      error: err => console.error(err),
      complete: null

    });
  }

  /**
   * reinitializes currently selected sound context
   */
  resetSoundContext() {
    this.SongCategories = [];
    this.Sounds = [];
    this.isSoundLoaded = false;
    this.selectedClip = undefined;
    this.selectedCategory = undefined;
    this.selectedClip = undefined;
    this.destPath = undefined;
  }

  /**
   * shows all sounds of selected category
   * @param category category of first drop down menu
   */
  showSound(category) {
    this.isSoundLoaded = true;
    this.selectedCategory = category;
    this.Sounds = [...this.soundService.soundMap.get(category).keys()];
  }

  /**
   * sets audio player to play source of name in second drop down menu
   * @param clipName clip to be played
   */
  playSound(clipName) {
    this.selectedClipName = clipName;
    this.selectedClip = this.soundService.soundMap.get(this.selectedCategory).get(clipName);
    const split = this.selectedClip.src.split('/');
    const file = split[split.length - 1];
    this.destPath = '../data/customSnd/' + this.selectedCategory + '/' + file;

    const player = document.getElementById('audio-player') as HTMLAudioElement;
    player.src = this.selectedClip.src;
  }

  /**
   * replaces the current selected audio
   */
  changeAudio() {
    dialog.showOpenDialog(options, (paths: string[]) => {
      if (paths === undefined) return;
      const newClip = new Audio(paths[0]);
      this.soundService.copyFile(paths[0], 'data/' + this.destPath, this.selectedCategory, this.selectedClipName, newClip);
    });
  }

  /**
   * reverts audio to default by deleting custom sound
   */
  revertAudio() {
    this.soundService.deleteSound('data/' + this.destPath);
    const name = this.destPath.split('customSnd')[1];
    const orig = new Audio('../data/snd' + name);
    this.soundService.editSoundMap(this.selectedCategory, this.selectedClipName, orig);

    const deleting = true;
    const split = this.destPath.split('/');
    const file = split[split.length - 1];
    const filepath = path.join(this.selectedCategory, file);
    this.soundService.updateCustomSoundMap(this.selectedCategory, filepath, undefined, deleting);
  }
}
