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
  // Sounds = ["Sound #1", "Sound #2", "Sound #3"];
  Sounds: string[] =  [];
  isCatLoaded: Boolean = false;
  isSoundLoaded: Boolean = false;
  selectedPath: string;
  selectedCategory: string;
  selectedSound: string;
  destPath: string;
  selectedSOUND: HTMLAudioElement;

  test: string;

  constructor(
    private mapService: MapService,
    private soundService: SoundService,
  ) {
    // console.log('thasdf' + this.serializeService.soundMap);
    // this.soundService.soundUpdated.do(x => console.log('soundUpdated: ', JSON.stringify(x))).subscribe({
    //   next: () => {
    //     document.getElementById('soundplayers').innerHTML = '<audio id="audio-player" controls="controls" src="../' + this.destPath + '" type="audio/wav">';
    //     console.log('next'); },
    //   error: err => console.error(err),
    //   complete: null
    // });
  }

  // fun_close() {
  //   document.getElementById('audioModal').setAttribute('style', 'display: none;');
  // }

  // SelectedAudio() {
  //   document.getElementById('audio1').setAttribute('style', 'background-color: #666; color:#fff;');
  // }

  loadSounds() {
    this.SongCategories = [...this.mapService.soundMap.keys()];
    this.isCatLoaded = true;
    this.selectedCategory = this.SongCategories[0];
    // document.getElementById('soundplayers').innerHTML = '<audio id="audio-player" controls="controls" src="' + this.destPath+ '" type="audio/wav">';

    // this.isSoundLoaded = true;
  }

  showSound(item) {
    this.isSoundLoaded = true;
    this.Sounds = [];
    const clipNames = this.mapService.soundMap.get(item);
    for (const name of clipNames.keys()) {
      this.Sounds.push(name);
    }
    this.selectedCategory = item;
    // document.getElementById('soundplayers').innerHTML = '<audio id="audio-player" controls="controls" src="' + this.mapService.soundMap.get(item) + '" type="audio/wav">';

  }

  // // updatePlayer() {
  // //   this.soundService.soundUpdated.do(x => console.log('soundUpdated: ', JSON.stringify(x))).subscribe({
  // //     next: () => {
  // //       document.getElementById('soundplayers').innerHTML = '<audio id="audio-player" controls="controls" src="../' + this.destPath + '" type="audio/wav">';
  // //       console.log('next'); },
  // //     error: err => console.error(err),
  // //     complete: null
  // //   });
  // // }

  playSound(item) {
    this.selectedSound = item;
    this.selectedPath = this.mapService.soundMap.get(this.selectedCategory).get(item);
    const file = this.selectedPath.split('/')[5];
    this.destPath = '../dist/assets/customSnd/' + this.selectedCategory + '/' + file;
    document.getElementById('soundplayers').innerHTML = '<audio id="audio-player" controls="controls" src="' + this.selectedPath + '" type="audio/wav">';
  }

  changeAudio() {
    let myaudio: HTMLAudioElement;
    dialog.showOpenDialog(options, (paths: string[]) => {
      if (paths === undefined) return;

      // const pathSplit = this.selectedPath.split('snd');
      // const dest = 'src/asset/customSnd' + pathSplit[1];
      // const dest = pathSplit[0] + 'customSnd' + pathSplit[1];
      // this.soundService.copyFile(paths[0], this.destPath);
      myaudio = new Audio(paths[0]);
      // this.selectedSOUND.play();
      this.soundService.copyFile(paths[0], 'dist/' + this.destPath);

      this.soundService.editSoundMap(this.selectedCategory, this.selectedSound, this.destPath);
      // document.getElementById('soundplayers').innerHTML = '<audio id="audio-player" controls="controls" src="' + myaudio.src + '" type="audio/wav">';
     // IO.loadMap(window, paths[0]);
    });
    // myaudio.play();
    console.log(this.mapService.soundMap);
  }

  revertAudio() {
    // const tbd = 'src/assets/customSnd/' + this.selectedCategory + '/' + this.selectedSound;
    console.log('DEST PATH; ' + this.destPath);
    this.soundService.deleteSound('dist/' + this.destPath);
    const name = this.destPath.split('customSnd')[1];
    const orig = '../dist/assets/snd' + name;
    this.soundService.editSoundMap(this.selectedCategory, this.selectedSound, orig);
    document.getElementById('soundplayers').innerHTML = '<audio id="audio-player" controls="controls" src="' + orig + '" type="audio/wav">';
  }

  ngOnInit() {
    this.SongCategories = [...this.mapService.soundMap.keys()];
    this.isCatLoaded = true;
    this.selectedCategory = this.SongCategories[0];

  }

  // private debug() {
  //   console.log([...this.mapService.soundMap.keys()]);
  //   console.log(this.SongCategories);
  // }
}
