import { Component, OnInit } from '@angular/core';
import { Menu } from 'electron';
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
  ) {
  }

  ngOnInit() {
    this.soundService.parseSndData();
    this.SongCategories = [...this.soundService.soundMap.keys()];
    this.selectedCategory = this.SongCategories[0];
  }


  showSound(category) {
    this.isSoundLoaded = true;
    this.Sounds = [];
    const clipNames = this.soundService.soundMap.get(category).keys();
    for (const name of clipNames) {
      this.Sounds.push(name);
    }
    this.selectedCategory = category;
    // document.getElementById('soundplayers').innerHTML = '<audio id="audio-player" controls="controls" src="' + this.soundService.soundMap.get(item) + '" type="audio/wav">';

  }

  playSound(clipName) {
    this.selectedClipName = clipName;
    this.selectedClip = this.soundService.soundMap.get(this.selectedCategory).get(clipName);
    const split = this.selectedClip.src.split('/');
    const file = split[split.length - 1];
    this.destPath = '../dist/assets/customSnd/' + this.selectedCategory + '/' + file;
    document.getElementById('soundplayers').innerHTML = '<audio id="audio-player" controls="controls" src="' + this.selectedClip.src + '" type="audio/wav">';
  }

  changeAudio() {
    dialog.showOpenDialog(options, (paths: string[]) => {
      if (paths === undefined) return;
      const newClip = new Audio(paths[0]);
      this.soundService.copyFile(paths[0], 'dist/' + this.destPath, this.selectedCategory, this.selectedClipName, newClip);
    });
    console.log(this.soundService.soundMap);
  }

  revertAudio() {
    console.log('DEST PATH; ' + this.destPath);
    this.soundService.deleteSound('dist/' + this.destPath);
    const name = this.destPath.split('customSnd')[1];
    const orig = new Audio('../dist/assets/snd' + name);
    this.soundService.editSoundMap(this.selectedCategory, this.selectedClipName, orig);
  }


}
