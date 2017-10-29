import { Injectable } from '@angular/core';
import { Subject, Observer, Subscription, Observable } from 'rxjs/Rx';
import { ipcRenderer } from 'electron';
import { TileType } from '../_classes/tile';

import { MapObject } from 'map';
import { Dimension, Region } from 'interfaces';

@Injectable()
export class MapService {
  private SPRITE_SIZE = 32;

  public map: MapObject;
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private _filePath: string;
  private terrainImg: HTMLImageElement;

  constructor() {
    this.map = new MapObject();

    // Event listener for when a map has been loaded from a file.
    // `mapData` is the raw file contents
    ipcRenderer.on('map:loaded', (event: Electron.IpcMessageEvent, mapData: string, filePath: string) => {
      this._filePath = filePath;
      this.map.init(mapData, filePath);
    });

    // Event listener for saving a map
    ipcRenderer.on('menu:file:save', (event: Electron.IpcMessageEvent, filePath?: string) => {
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

      console.log('saving...');
      ipcRenderer.send('map:save', response, this._filePath);
    });

    ipcRenderer.on('terrain:loaded', (event: Electron.IpcMessageEvent, terrainData: string) => {
      this.map.setTileSet(terrainData);
    });

    this.terrainImg = new Image();
    this.terrainImg.src = 'assets/img/Terrain.png';

    this.subscribeToTilesUpdated({
      next: reg => this.drawMap(reg),
      error: err => console.error(err),
      complete: null
    });
  }

  public subscribeToMapLoaded(observer: Observer<Dimension>) {
    return this.map.subscribeToMapLoaded(observer);
  }

  public subscribeToTilesUpdated(observer: Observer<Region>) {
    return this.map.subscribeToTilesUpdated(observer);
  }

  // Save canvas context from map.component.ts
  public setCanvas(c: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void {
    this.canvas = c;
    this.context = ctx;

    // TEMP until zooming is implemented
    // this.context.scale(.6, .6);

    this.setClickListeners();

    // TEMP for testing
    // ipcRenderer.send('map:load', './src/assets/bay.map');
  }

  // Listen for clicks on canvas. Uses () => to avoid scope issues. event contains x,y coordinates.
  private setClickListeners() {
    this.canvas.addEventListener('mousedown', (event) => {
      if (this.map !== undefined && this.map.canSave) {
        const x: number = Math.floor(event.offsetX / 32);
        const y: number = Math.floor(event.offsetY / 32);
        this.map.updateTiles(TileType.Rock, { x, y, width: 1, height: 1 });
      }
    }, false);
  }

  // Draws Map when loaded from file.
  public drawMap(reg: Region = { x: 0, y: 0, width: this.map.width, height: this.map.height }): void {
    if (reg.y < 0) reg.y = 0;
    if (reg.x < 0) reg.x = 0;
    if (reg.y + reg.height > this.map.height) reg.y = this.map.height - reg.height;
    if (reg.x + reg.width > this.map.width) reg.x = this.map.width - reg.width;

    for (let x = reg.x; x < reg.x + reg.width; x++) {
      for (let y = reg.y; y < reg.y + reg.width; y++) {
        this.drawImage(y, x, this.map.drawLayer[y][x].index);
      }
    }
  }

  // Draws a single tile in an (x,y) coordinate, using an index to Terrain.png
  private drawImage(y: number, x: number, index: number): void {
    this.context.drawImage(this.terrainImg, 0, index * 32, 32, 32, x * 32, y * 32, 32, 32);
  }
}
