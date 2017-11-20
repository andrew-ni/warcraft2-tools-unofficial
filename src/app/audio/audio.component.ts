import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-audio',
  templateUrl: './audio.component.html',
  styleUrls: ['./audio.component.scss']
})
export class AudioComponent implements OnInit {

  SongCategories = ["BGM", "Peasant", "Footman", "Archer", "Ranger"];
  Sounds = ["Sound #1", "Sound #2", "Sound #3"];
  
  constructor() { }

  fun_close() {
    document.getElementById('audioModal').setAttribute('style', 'display: none;');
  }

  SelectedAudio() {
    document.getElementById('audio1').setAttribute('style', 'background-color: #666; color:#fff;');
  }

  ngOnInit() {
  }

}

