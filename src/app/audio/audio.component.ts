import { Component, OnInit } from '@angular/core';
import { MapService } from 'services/map.service';
import { SerializeService } from 'services/serialize.service';
import { SoundService } from 'services/sound.service';

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
    // const myDict: Map<number, String> = new Map<number, String>();
    // myDict.set(100, '1');
    // myDict.set(3, '2');
    // console.log(Object.getOwnPropertyNames(myDict));
    // console.log(Object.getOwnPropertySymbols(myDict));
    this.Sounds = [...this.mapService.soundMap.keys()];
    this.isLoaded = true;


  }

  showSound(item) {
    console.log(this.mapService.soundMap.get(item));
    document.getElementById('soundplayers').innerHTML = '<audio id="audio-player" controls="controls" src="' + this.mapService.soundMap.get(item) + '" type="audio/wav">';

  }

  ngOnInit() {
  }

}

