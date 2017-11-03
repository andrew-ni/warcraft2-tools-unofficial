import { Injectable } from '@angular/core';
import { ipcRenderer } from 'electron';
import { Subject } from 'rxjs/Rx';

import { MapService } from 'services/map.service';
import { SerializeService } from 'services/serialize.service';
import { TerrainService } from 'services/terrain.service';

interface IMap {
  mapLoaded: Subject<void>;
}

@Injectable()
export class IOService {

  private _mapFilePath: string;
  private map: IMap;

  constructor(
    mapService: MapService,
    private terrainService: TerrainService,
    private serializeService: SerializeService,
  ) {
    this.map = mapService;

    /**
     * Event listener for when a map has been loaded from a file
     * `mapData` is the raw file contents as a string
     */
    ipcRenderer.on('map:loaded', (event: Electron.IpcMessageEvent, mapData: string, filePath: string) => {
      this._mapFilePath = filePath;
      this.serializeService.initMapFromFile(mapData, filePath);
    });

    /**
     * Event listener for when we want to save the map
     */
    ipcRenderer.on('menu:file:save', (event: Electron.IpcMessageEvent, filePath?: string) => {
      if (filePath) {
        this._mapFilePath = filePath;    // update our save location
      }

      const response: string = this.serializeService.serializeMap();

      if (response === undefined) {
        console.warn('save-map rejected because Map returned null');
        // TODO: add save-failed message

        return; // don't make ipc call
      }

      console.log('saving...');
      ipcRenderer.send('map:save', response, this._mapFilePath);
    });

    /**
     * Event listener for once the terrain is loaded, send next event to calcTileIndices(). See terrain.service.ts
     */
    ipcRenderer.on('terrain:loaded', (event: Electron.IpcMessageEvent, terrainData: string) => {
      this.serializeService.parseTileSet(terrainData);
      this.map.mapLoaded.next();
      console.log('terrain loaded');
    });
  }
}
