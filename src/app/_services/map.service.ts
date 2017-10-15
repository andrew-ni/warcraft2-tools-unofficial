import { Injectable } from '@angular/core';
import { ipcRenderer } from 'electron';

import { Map } from 'map';

@Injectable()
export class MapService {
  private _map: Map;
  private _filePath: string;

  constructor() {
    // Event listener for when a map has been loaded from a file.
    // `mapData` is the raw file contents
    ipcRenderer.on('map:loaded', (event, mapData, filePath) => {
      this._filePath = filePath;
      this._map = new Map(mapData);
    });
  }

  get map(): Map {
    return this._map;
  }
}
