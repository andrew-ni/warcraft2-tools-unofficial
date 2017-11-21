import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-audio',
  templateUrl: './audio.component.html',
  styleUrls: ['./audio.component.scss']
})
export class AudioComponent implements OnInit {

  SongCategories = ["BGM", "Peasant", "Footman", "Archer", "Ranger"];

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

require('electron').ipcRenderer.on('menu:file:audio', () => {
  document.getElementById('audioModal').setAttribute('style', 'display: inline;');
});
