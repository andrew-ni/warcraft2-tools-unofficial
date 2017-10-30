import { Injectable } from '@angular/core';
import { Subject, Observer, Subscription, Observable } from 'rxjs/Rx';
import { ipcRenderer } from 'electron';
import { TileType } from '../_classes/tile';

import { MapObject } from 'map';
import { Dimension, Region, Coordinate } from 'interfaces';
import { readdir } from 'fs';
import { UserService } from 'services/user.service';
import { PlayerColor, numToColor } from 'player';

@Injectable()
export class MapService {
  private readonly TERRAIN_SIZE = 32; // size of a single terrain tile, in pixels

  public map: MapObject;
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private _filePath: string;
  private assetMap: Map<string, HTMLImageElement>;
  private fs;
  private path;

  constructor(private userService: UserService) {
    this.map = new MapObject();
    // Load assets before, and independently of map:loaded.
    this.fs = require('fs');
    this.path = require('path');
    this.assetMap = new Map<string, HTMLImageElement>();
    this.loadAssets();

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
      this.drawAssets(); // drawAssets only after terrain is loaded
    });

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
    this.setClickListeners();
  }

  // Handles clickEvents like clickdrag and panning.
  private setClickListeners() {
    let clickPos: Coordinate;

    const placeMapElementAtCursor = (event: MouseEvent) => {
      if (this.map !== undefined) {
        const x = Math.floor(event.offsetX / this.TERRAIN_SIZE);
        const y = Math.floor(event.offsetY / this.TERRAIN_SIZE);
        this.userService.applySelectedType(
          (tileType) => this.map.updateTiles(tileType, { y, x, width: 1, height: 1 }),
          (assetType) => { this.map.placeAsset(1, assetType, x, y, false); this.drawAssets(); },
        );
      }
    };

    // https://stackoverflow.com/a/34030504
    const pan = (event: MouseEvent) => {
      if (this.map !== undefined) {
        document.body.style.cursor = 'move';
        this.canvas.parentElement.scrollLeft += clickPos.x - event.offsetX;
        this.canvas.parentElement.scrollTop += clickPos.y - event.offsetY;
      }
    };

    // Helper function to remove mousemove listeners. Called on mouseup or mouseleave.
    const removeListeners = () => {
      document.body.style.cursor = 'auto';
      this.canvas.removeEventListener('mousemove', placeMapElementAtCursor, false);
      this.canvas.removeEventListener('mousemove', pan, false);
    };

    // On mousedown, route to appropriate function (clickdrag or pan)
    // https://developer.mozilla.org/en-US/docs/Web/Events/mousedown
    // 0 = left click, 1 = middle click, 2 = right click
    this.canvas.addEventListener('mousedown', (event) => {
      clickPos = { x: event.offsetX, y: event.offsetY };
      this.canvas.addEventListener('mouseleave', removeListeners, false); // cancels current action if mouse leaves canvas
      if (event.button === 0) { placeMapElementAtCursor(event); this.canvas.addEventListener('mousemove', placeMapElementAtCursor, false); }
      if (event.button === 2) { this.canvas.addEventListener('mousemove', pan, false); }
    });

    // On mouseup, remove listeners
    this.canvas.addEventListener('mouseup', (event) => {
      removeListeners();
      this.canvas.removeEventListener('mouseleave', function () { }, false);
    });
  }

  // TODO: read the .dat files for more information, filter readdir()
  // Finds files in /assets/img/, and replaces .dat with .png.
  // Creates Image() for each then inserts <string, image> into assetMap.
  private loadAssets() {
    const myPath = './src/assets/img/';
    const myFiles = this.fs.readdirSync(myPath);

    for (const i in myFiles) {
      if (this.path.extname(myFiles[i]) === '.dat') {
        const temp = String(myFiles[i]);
        const temp2 = temp.substring(0, temp.length - 4);

        const tempImage = new Image();
        tempImage.src = 'assets/img/' + temp2 + '.png';
        this.assetMap.set(temp2, tempImage);
      }
    }
  }

  // Draws Map when loaded from file.
  public drawMap(reg: Region = { x: 0, y: 0, width: this.map.width, height: this.map.height }): void {
    if (reg.y < 0) reg.y = 0;
    if (reg.x < 0) reg.x = 0;
    if (reg.y + reg.height > this.map.height) reg.height = this.map.height - reg.y;
    if (reg.x + reg.width > this.map.width) reg.width = this.map.width - reg.x;
    const terrain = this.assetMap.get('Terrain');
    for (let x = reg.x; x < reg.x + reg.width; x++) {
      for (let y = reg.y; y < reg.y + reg.width; y++) {
        this.drawImage(terrain, terrain.width, y, x, this.map.drawLayer[y][x].index);
      }
    }
  }

  // Draws Assets layer using Assets[] array from map.ts
  public drawAssets(yStart: number = 0, xStart: number = 0, height: number = this.map.height, width: number = this.map.width): void {
    console.log(this.map.mapLayer2);
    for (const asset of this.map.assets) {
      const img = this.assetMap.get(asset.type);
      this.drawImage(img, img.width, asset.y, asset.x, 0);
    }
  }

  // PARMS: image (assetMap.get(imgName), width (use image.width), y, x (in 32x32 pixels), index (position on spritesheet)
  private drawImage(image: HTMLImageElement, width: number, y: number, x: number, index: number): void {
    this.context.drawImage(image, 0, index * width, width, width, x * this.TERRAIN_SIZE, y * this.TERRAIN_SIZE, width, width);
  }
}
