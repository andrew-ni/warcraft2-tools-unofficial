import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-newmap',
  templateUrl: './newmap.component.html',
  styleUrls: ['./newmap.component.scss']
})
export class NewmapComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  fun_close(){
    document.getElementById('newMapModal').setAttribute("style", "display: none;");
  }
}

require('electron').ipcRenderer.on('menu:file:new', () => {
  document.getElementById('newMapModal').setAttribute("style", "display: inline;");
})