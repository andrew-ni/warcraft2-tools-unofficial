import { Injectable } from '@angular/core';
import { ipcRenderer } from 'electron';
import { MapService } from 'services/map.service';
import { TerrainService } from 'services/terrain.service';
import { SerializeService } from 'services/serialize.service';

@Injectable()
export class IOService {

  private _mapFilePath: string;
  private map: MapService;

  constructor(
    private mapService: MapService,
    private terrainService: TerrainService,
    private serializeService: SerializeService,
  ) {
    this.map = this.mapService;
    // Event listener for when a map has been loaded from a file.
    // `mapData` is the raw file contents
    ipcRenderer.on('map:loaded', (event: Electron.IpcMessageEvent, mapData: string, filePath: string) => {
      this._mapFilePath = filePath;
      this.serializeService.initMapFromFile(mapData, filePath);
    });

    // Event listener for saving a map
    ipcRenderer.on('menu:file:save', (event: Electron.IpcMessageEvent, filePath?: string) => {
      if (this.map === undefined) {
        console.log('save-map rejected because Map was not created');
        return;
      }

      if (filePath) {
        this._mapFilePath = filePath;    // update our save location
      }

      const response: string = this.serializeService.serializeMap();

      if (response === undefined) {
        console.warn('save-map rejected because Map returned null');
        // TODO: add save-failed message

        return; // return without making ipc call
      }

      console.log('saving...');
      ipcRenderer.send('map:save', response, this._mapFilePath);
    });

    ipcRenderer.on('terrain:loaded', (event: Electron.IpcMessageEvent, terrainData: string) => {
      this.serializeService.parseTileSet(terrainData);
      this.mapService.mapLoaded.next();
      console.log('terrain loaded');

      // this.canvasService.drawAssets(); // drawAssets only after terrain is loaded
    });
   }
}
