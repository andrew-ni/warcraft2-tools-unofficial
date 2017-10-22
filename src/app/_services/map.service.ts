import { Injectable } from '@angular/core';
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

  constructor() {
    // Event listener for when a map has been loaded from a file.
    // `mapData` is the raw file contents
    ipcRenderer.on('map:loaded', (event: Electron.IpcMessageEvent, mapData: string, filePath: string) => {
      this._filePath = filePath;
      this.map = new Map(mapData);

      // TEMP until canvas is properly redrawn
      setInterval(() => this.drawMap(), 200);
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

  // Save canvas context from map.component.ts
  public setCanvas(c: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void {
    this.canvas = c;
    this.context = ctx;

    // TEMP until zooming is implemented
    this.context.scale(.6, .6);

    this.setClickListener();
  }

  // Listen for clicks on canvas. Uses () => to avoid scope issues. event contains x,y coordinates.
  private setClickListener() {
    this.canvas.addEventListener('mousedown', () => this.clicked(event), false);
  }

  // Fires everytime click occurs. Prints coords and tile info at click location.
  private clicked(event) {
    const x: number = Math.floor(event.pageX / 32);
    const y: number = Math.floor(event.pageY / 32);
    console.log(x + ' ' + y);
    if (this.map !== undefined) {
      console.log(this.map.drawLayer[x][y].tileType);

      // TEST CODE for updating tile
      // this.map.updateTiles(TileType.Rock, y, x, 1, 1);
      // this.drawMap();
    }
  }

  // Draws Map when loaded from file.
  private drawMap(): void {
    // this.drawImage(0, 0, 0);
    // this.drawImage(2, 2, 10);
    // this.drawImage(4, 4, 22);
    // this.drawImage(6, 6, 252);
    // let i: number;
    // for (i = 0; i < 50; i++) {
    //   this.context.fillText('' + i, 35, i * 32 + 10);
    //   this.drawImage(0, i, i);
    // }

    let x: number;
    let y: number;
    for (x = 0; x < this.map.drawLayer.length - 1; x++) {
      for (y = 0; y < this.map.drawLayer[x].length - 1; y++) {
        this.drawImage(x, y, this.map.drawLayer[y][x].index);
      }
    }
  }

  // Draws a single tile in an (x,y) coordinate, using an index to Terrain.png
  private drawImage(x: number, y: number, index: number): void {
    this.context.drawImage(this.terrainImg, 0, index * 32, 32, 32, x * 32, y * 32, 32, 32);
  }
}
