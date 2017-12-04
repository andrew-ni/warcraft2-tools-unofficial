import { Component, OnInit } from '@angular/core';
import { Menu } from 'electron';
import { IOService } from 'services/io.service';
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
  packageLoaded: Boolean = false;
  packageLoadedCount = 0;
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
    fsx.emptyDirSync(IOService.CUSTOMSND_DIR);
    this.soundService.parseSndData();

    this.mapService.mapProjectLoaded.do(() => console.log('mapProjectLoaded')).subscribe({
      next: () => {
        this.soundService.parseSndData();
        fsx.emptyDirSync(IOService.CUSTOMSND_DIR);
        this.resetSoundPlayer();
        this.resetSoundContext();

        // upon app starting, mapProjectLoaded is triggered before a custom package is loaded in,
        // and user shouldn't be allowed to edit sounds without loading a package first.
        if (this.packageLoadedCount > 0) {
          this.packageLoaded = true;
        }
        this.packageLoadedCount++;
        if (this.packageLoaded) {
          this.SongCategories = [...this.soundService.soundMap.keys()];
        } else {
          this.SongCategories = [];
        }
      },
      error: err => console.error(err),
      complete: null
    });

    this.mapService.customSndLoaded.do(() => console.log('customSndLoaded')).subscribe({
      next: () => {
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
    this.selectedClipName = undefined;
    this.selectedCategory = undefined;
    this.destPath = undefined;
  }

  /**
   * restarts the HTML sound player
   */
  resetSoundPlayer() {
    const player = document.getElementById('audio-player') as HTMLAudioElement;
    player.src = '';
  }

  /**
   * shows all sounds of selected category
   * @param category category of first drop down menu
   */
  showSound(category: string) {
    this.isSoundLoaded = true;
    this.selectedCategory = category;
    this.selectedClipName = undefined;
    this.resetSoundPlayer();
    this.Sounds = [...this.soundService.soundMap.get(category).keys()];
  }

  /**
   * sets audio player to play source of name in second drop down menu
   * @param clipName clip to be played
   */
  playSound(clipName: string) {
    this.selectedClipName = clipName;
    this.selectedClip = this.soundService.soundMap.get(this.selectedCategory).get(clipName);
    const split = this.selectedClip.src.split('/');
    const file = split[split.length - 1];
    this.destPath = path.join('..', IOService.CUSTOMSND_DIR, this.selectedCategory, file);

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
      this.soundService.copyFile(paths[0], path.join('data', this.destPath), this.selectedCategory, this.selectedClipName, newClip);
    });
  }

  /**
   * reverts audio to default by deleting custom sound
   */
  revertAudio() {
    this.soundService.deleteSound(path.join('data', this.destPath));
    const name = this.destPath.split('customSnd')[1];
    const orig = new Audio(path.join('..', 'data', 'snd', name));
    this.soundService.editSoundMap(this.selectedCategory, this.selectedClipName, orig);

    const split = this.destPath.split('/');
    const file = split[split.length - 1];
    this.soundService.updateCustomSoundMap(this.selectedCategory, file, undefined, true);
  }
}
