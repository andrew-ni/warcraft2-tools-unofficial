import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-tileset',
  templateUrl: './tileset.component.html',
  styleUrls: ['./tileset.component.scss']
})
export class TilesetComponent implements OnInit {

  constructor() { }

  fun_close() {
    document.getElementById('tilesetModal').setAttribute('style', 'display: none;');
  }

  ngOnInit() {
  }

}

