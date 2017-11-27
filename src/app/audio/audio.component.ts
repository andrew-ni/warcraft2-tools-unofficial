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

  test: string;

  constructor(
    private mapService: MapService,
    private soundService: SoundService,
  ) {
    // console.log('thasdf' + this.serializeService.soundMap);
    // this.Sounds = Object.keys(this.mapService.soundMap);
    // this.soundService.soundUpdated.do(x => console.log('soundUpdated: ', JSON.stringify(x))).subscribe({
    //   next: () => {
    //     document.getElementById('soundplayers').innerHTML = '<audio id="audio-player" controls="controls" src="../' + this.destPath + '" type="audio/wav">';
    //     console.log('next'); },
    //   error: err => console.error(err),
    //   complete: null
    // });
  }

  fun_close() {
    document.getElementById('audioModal').setAttribute('style', 'display: none;');
  }

  SelectedAudio() {
    document.getElementById('audio1').setAttribute('style', 'background-color: #666; color:#fff;');
  }

  loadSounds() {
    console.log('loadSounds');
    this.SongCategories = [...this.mapService.soundMap.keys()];
    this.isCatLoaded = true;
    this.selectedCategory = this.SongCategories[0];
    // this.isSoundLoaded = true;

  }

  showSound(item) {
    console.log('showSound');
    this.isSoundLoaded = true;
    this.Sounds = [];
    const fileToPaths = this.mapService.soundMap.get(item);
    for (const key of fileToPaths.keys()) {
      this.Sounds.push(key);
    }
    this.selectedCategory = item;
    // document.getElementById('soundplayers').innerHTML = '<audio id="audio-player" controls="controls" src="' + this.mapService.soundMap.get(item) + '" type="audio/wav">';

  }

  // updatePlayer() {
  //   this.soundService.soundUpdated.do(x => console.log('soundUpdated: ', JSON.stringify(x))).subscribe({
  //     next: () => {
  //       document.getElementById('soundplayers').innerHTML = '<audio id="audio-player" controls="controls" src="../' + this.destPath + '" type="audio/wav">';
  //       console.log('next'); },
  //     error: err => console.error(err),
  //     complete: null
  //   });
  // }

  playSound(item) {
    this.selectedPath = this.mapService.soundMap.get(this.selectedCategory).get(item);
    this.selectedSound = item;
    const file = this.selectedPath.split('/')[4];
    this.destPath = 'src/assets/customSnd/' + this.selectedCategory + '/' + file;
    console.log('playsound');
    document.getElementById('soundplayers').innerHTML = '<audio id="audio-player" controls="controls" src="../' + this.selectedPath + '" type="audio/wav">';
  }

  changeAudio() {
    console.log('loading new audio...');
    dialog.showOpenDialog(options, (paths: string[]) => {
      if (paths === undefined) return;

      console.log(paths[0]);
      const pathSplit = this.selectedPath.split('snd');
      // const dest = 'src/asset/customSnd' + pathSplit[1];
      const dest = pathSplit[0] + 'customSnd' + pathSplit[1];
      console.log(dest);
      this.soundService.copyFile(paths[0], dest);
      // this.soundService.editSoundMap(this.selectedCategory, this.selectedSound, dest);
     // IO.loadMap(window, paths[0]);
    });
    console.log(this.mapService.soundMap);
  }

  revertAudio() {
    const tbd = 'src/assets/customSnd/' + this.selectedCategory + '/' + this.selectedSound;
    console.log(tbd);
    this.soundService.deleteSound(tbd);
  }

  ngOnInit() {
    this.SongCategories = [...this.mapService.soundMap.keys()];
    this.isCatLoaded = true;
    this.selectedCategory = this.SongCategories[0];

  }

  private debug() {
    console.log([...this.mapService.soundMap.keys()]);
    console.log(this.SongCategories);
  }
}
