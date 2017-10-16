import { Injectable } from '@angular/core';
import { ipcRenderer } from 'electron';

import { Map } from 'map';

@Injectable()
export class MapService {
  public map: Map;
  private _filePath: string;

  constructor() {
    // Event listener for when a map has been loaded from a file.
    // `mapData` is the raw file contents
    ipcRenderer.on('map:loaded', (event, mapData, filePath) => {
      this._filePath = filePath;
      this.map = new Map(mapData);
      console.log(this.map);
    });

    // Event listener for saving a map
    ipcRenderer.on('menu:file:save', (event) => {
      console.log('save-map request received');
      // TODO: call stringify() and notify main thread
      ipcRenderer.send('map:save', this.map.stringify(), this._filePath);
    });
  }
}
