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
    ipcRenderer.on('map:loaded', (event: Electron.IpcMessageEvent, mapData: string, filePath: string) => {
      this._filePath = filePath;
      this.map = new Map(mapData);
      console.log(this.map);
    });

    // Event listener for saving a map
    ipcRenderer.on('menu:file:save', (event: Electron.IpcMessageEvent, filePath?: string) => {
      // DEBUG: clean up console logs
      console.log('save-map request received');

      if (this.map === undefined) {
        console.log('save-map rejected because Map was not created');
        return;
      }

      if (filePath) {
        this._filePath = filePath;    // update our save location
      }

      const response: string = this.map.stringify();

      if (response === undefined) {
        console.warn('save-map rejected because Map returned null');
        // TODO: add save-failed message

        return; // return without making ipc call
      }

      ipcRenderer.send('map:save', response, this._filePath);
    });
  }
}
