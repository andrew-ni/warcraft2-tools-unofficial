import { Injectable } from '@angular/core';
import { ipcRenderer } from 'electron';
import { TileType } from '../_classes/tile';

import { Map } from 'map';

@Injectable()
export class MapService {
  // const SPRITE_SIZE = 32;

  public map: Map;
  private context: CanvasRenderingContext2D;
  private _filePath: string;
  private terrainImg: HTMLImageElement;

  constructor() {
    // Event listener for when a map has been loaded from a file.
    // `mapData` is the raw file contents
    ipcRenderer.on('map:loaded', (event: Electron.IpcMessageEvent, mapData: string, filePath: string) => {
      this._filePath = filePath;
      this.map = new Map(mapData);
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
    console.log('terrainImg');
  }

  // Save canvas context from map.component.ts
  public setContext(ctx: CanvasRenderingContext2D): void {
    this.context = ctx;
  }

  // Draws inital Map when user loads
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

    for (x = 0; x < this.map.mapLayer1.length; x++) {
      for (y = 0; y < this.map.mapLayer1[x].length; y++) {
        this.drawImage(x, y, tileTypeToNum[this.map.mapLayer1[x][y].tileType]);
      }
    }
  }

  private drawImage(x: number, y: number, index: number): void {
    this.context.drawImage(this.terrainImg, 0, index * 32, 32, 32, x * 32, y * 32, 32, 32);

  }

  private convertTile() {

  }
}

export const tileTypeToNum: TileType[] = [];
// TileType.xxx within the square brackets will implicitly be cast to string
// but the TileType.xxx being assigned will not be casted.
// This allows for mapping from string to TileType
tileTypeToNum[TileType.DarkGrass] = 17;
tileTypeToNum[TileType.LightGrass] = 14;
tileTypeToNum[TileType.DarkDirt] = 11;
tileTypeToNum[TileType.LightDirt] = 8;
tileTypeToNum[TileType.Rock] = 23;
tileTypeToNum[TileType.RockPartial] = 23;
tileTypeToNum[TileType.Forest] = 20;
tileTypeToNum[TileType.ForestPartial] = 20;
tileTypeToNum[TileType.ShallowWater] = 27;
tileTypeToNum[TileType.DeepWater] = 0;
