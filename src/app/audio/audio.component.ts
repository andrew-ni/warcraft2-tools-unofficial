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

  SongCategories = ['BGM', 'Peasant', 'Footman', 'Archer', 'Ranger'];
  // Sounds = ["Sound #1", "Sound #2", "Sound #3"];
  Sounds: String[] =  [];
  isLoaded: Boolean = false;

  constructor(
    private mapService: MapService,
    private soundService: SoundService,
  ) {
    // console.log('thasdf' + this.serializeService.soundMap);
    // this.Sounds = Object.keys(this.mapService.soundMap);
   }

  fun_close() {
    document.getElementById('audioModal').setAttribute('style', 'display: none;');
  }

  SelectedAudio() {
    document.getElementById('audio1').setAttribute('style', 'background-color: #666; color:#fff;');
  }

  loadSounds() {
    this.Sounds = [...this.mapService.soundMap.keys()];
    this.isLoaded = true;


  }

  showSound(item) {
    console.log(this.mapService.soundMap.get(item));
    document.getElementById('soundplayers').innerHTML = '<audio id="audio-player" controls="controls" src="' + this.mapService.soundMap.get(item) + '" type="audio/wav">';

  }

  changeAudio() {
    console.log('loading new audio...');
    dialog.showOpenDialog(options, (paths: string[]) => {
      if (paths === undefined) return;

      console.log(paths[0]);
      // nonononno the path is the destination, source has to come from the selection menu
      const fileSplit = paths[0].split('/');
      const fileName  = fileSplit[fileSplit.length - 1];
      this.soundService.copyFile(paths[0], './dist/assets/customSnd/archer/' + fileName);
    });
  }

  revertAudio() {

  }

  ngOnInit() {
  }

}

