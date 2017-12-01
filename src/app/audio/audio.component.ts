import { Component, OnInit } from '@angular/core';
import { Menu } from 'electron';
import { MapService } from 'services/map.service';
import { SerializeService } from 'services/serialize.service';
import { SoundService } from 'services/sound.service';
const { dialog } = require('electron').remote;


const options = {
  filters: [
    { name: 'Audio File (.wav)', extensions: ['wav'] }
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

  ngOnInit() {
    this.soundService.parseSndData();
    this.SongCategories = [...this.soundService.soundMap.keys()];
    this.selectedCategory = this.SongCategories[0];

    this.mapService.mapProjectLoaded.do(() => console.log('soundLoaded')).subscribe({
      next: async () => {
        this.soundService.parseSndData();
        this.SongCategories = [...this.soundService.soundMap.keys()];
        this.selectedCategory = this.SongCategories[0];
      },
      error: err => console.error(err),
      complete: null
    });

  }


  showSound(category) {
    this.isSoundLoaded = true;
    this.selectedCategory = category;

    this.Sounds = [...this.soundService.soundMap.get(category).keys()];
    // document.getElementById('soundplayers').innerHTML = '<audio id="audio-player" controls="controls" src="' + this.soundService.soundMap.get(item) + '" type="audio/wav">';
  }

  playSound(clipName) {
    this.selectedClipName = clipName;
    this.selectedClip = this.soundService.soundMap.get(this.selectedCategory).get(clipName);
    const split = this.selectedClip.src.split('/');
    const file = split[split.length - 1];
    this.destPath = '../data/customSnd/' + this.selectedCategory + '/' + file;
    document.getElementById('soundplayers').innerHTML = '<audio id="audio-player" controls="controls" src="' + this.selectedClip.src + '" type="audio/wav">';
  }

  changeAudio() {
    dialog.showOpenDialog(options, (paths: string[]) => {
      if (paths === undefined) return;
      const newClip = new Audio(paths[0]);
      this.soundService.copyFile(paths[0], 'data/' + this.destPath, this.selectedCategory, this.selectedClipName, newClip);
    });
    console.log(this.soundService.soundMap);
  }

  revertAudio() {
    this.soundService.deleteSound('data/' + this.destPath);
    const name = this.destPath.split('customSnd')[1];
    const orig = new Audio('../data/snd' + name);
    this.soundService.editSoundMap(this.selectedCategory, this.selectedClipName, orig);
  }


}
