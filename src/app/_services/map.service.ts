import { Injectable } from '@angular/core';
import { Subject, Observer } from 'rxjs/Rx';
import { ipcRenderer } from 'electron';
import { TileType } from '../_classes/tile';

import { Map } from 'map';

@Injectable()
export class MapService {
  // const SPRITE_SIZE = 32;

  public map: Map;
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private _filePath: string;
  private terrainImg: HTMLImageElement;

  private _mapLoaded = new Subject<{ width: number, height: number }>();


  constructor() {
    // Event listener for when a map has been loaded from a file.
    // `mapData` is the raw file contents
    ipcRenderer.on('map:loaded', (event: Electron.IpcMessageEvent, mapData: string, filePath: string) => {
      this._filePath = filePath;
      this.map = new Map(mapData);
      this._mapLoaded.next({ width: this.map.width, height: this.map.height });

      // TEMP until canvas is properly redrawn
      // setInterval(() => this.drawMap(), 200);
      this.drawMap();
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

    this.terrainImg = new Image();
    this.terrainImg.src = 'assets/Terrain.png';
  }

  public subscribeToMapLoaded(observer: Observer<{ width: number, height: number }>) {
    return this._mapLoaded.subscribe(observer);
  }

  // Save canvas context from map.component.ts
  public setCanvas(c: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void {
    this.canvas = c;
    this.context = ctx;

    // TEMP until zooming is implemented
    // this.context.scale(.6, .6);

    this.setClickListener();

    // TEMP for testing
    ipcRenderer.send('map:load', './src/assets/bay.map');
  }

  // Listen for clicks on canvas. Uses () => to avoid scope issues. event contains x,y coordinates.
  private setClickListener() {
    this.canvas.addEventListener('mousedown', (event) => {
      const x: number = Math.floor(event.pageX / 32);
      const y: number = Math.floor(event.pageY / 32);
      console.log(x + ' ' + y);
      if (this.map !== undefined) {
        console.log(this.map.drawLayer[x][y].tileType);
  
        // TEST CODE for updating tile
        const [yStart, xStart, height, width] = this.map.updateTiles(TileType.Rock, y, x, 1, 1);
        this.drawMap(yStart, xStart, height, width);
      }
    }, false);
  }

  // Draws Map when loaded from file.
  public drawMap(yStart: number = 0, xStart: number = 0, height: number = this.map.height, width: number = this.map.width): void {
    if (yStart < 0) {
      yStart = 0;
    }
    if (xStart < 0) {
      xStart = 0;
    }
    if (yStart > this.map.height - 1) {
      yStart = this.map.height - 1;
    }
    if (xStart > this.map.width - 1) {
      xStart = this.map.width - 1;
    }

    for (let x = xStart; x < xStart + width; x++) {
      for (let y = yStart; y < yStart + height; y++) {
        this.drawImage(y, x, this.map.drawLayer[y][x].index);
      }
    }
  }

  // Draws a single tile in an (x,y) coordinate, using an index to Terrain.png
  private drawImage(y: number, x: number, index: number): void {
    this.context.drawImage(this.terrainImg, 0, index * 32, 32, 32, x * 32, y * 32, 32, 32);
  }
}
