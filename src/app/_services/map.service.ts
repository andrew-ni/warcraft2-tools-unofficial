import { Injectable } from '@angular/core';
import { Subject, Observer, Subscription, Observable } from 'rxjs/Rx';
import { ipcRenderer } from 'electron';
import { TileType } from '../_classes/tile';

import { MapObject } from 'map';
import { Dimension, Region } from 'interfaces';
import { readdir } from 'fs';
import { UserService } from 'services/user.service';

@Injectable()
export class MapService {
  private SPRITE_SIZE = 32;

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

    // TEMP until zooming is implemented
    // this.context.scale(.6, .6);

    this.setClickListeners();

    // TEMP for testing
    // ipcRenderer.send('map:load', './src/assets/bay.map');
  }

  // Listen for clicks on canvas. Uses () => to avoid scope issues. event contains x,y coordinates.
  private setClickListeners() {
    const self = this; // trying to find way around this. will ask ben
    let curXPos = 0;
    let curYPos = 0;


    function drawTile(event) {
      if (self.map !== undefined) {
        const x: number = Math.floor(event.offsetX / 32);
        const y: number = Math.floor(event.offsetY / 32);
        self.map.updateTiles(self.userService.selectedTerrain, {y, x, width: 1, height: 1});
      }
    }

    // https://stackoverflow.com/a/34030504
    function pan(event) {
      // console.log(document.body.scrollLeft + (curXPos - event.offsetX));
      // console.log(document.body.scrollTop + (curYPos - event.offsetY));
      if (self.map !== undefined) {
        document.body.style.cursor = 'move';
        window.scrollTo(document.body.scrollLeft + (curXPos - event.offsetX), document.body.scrollTop + (curYPos - event.offsetY));
      }
    }

    // https://developer.mozilla.org/en-US/docs/Web/Events/mousedown
    // 0 = left click, 1 = middle, 2 = right click
    this.canvas.addEventListener('mousedown', (event) => {
      curYPos = event.offsetY;
      curXPos = event.offsetX;
      if (event.button === 0) {
        drawTile(event);
        this.canvas.addEventListener('mousemove', drawTile, false);
      }
      if (event.button === 2) {
        console.log('right click pressed');
        this.canvas.addEventListener('mousemove', pan, false);
      }
    });

    this.canvas.addEventListener('mouseup', (event) => {
      document.body.style.cursor = 'auto';
      this.canvas.removeEventListener('mousemove', drawTile, false);
      this.canvas.removeEventListener('mousemove', pan, false);
    });
  }

  // TODO: clean this up with regexp?
  // loops through .dat files in /assets/img/, and replaces .dat with .png, creates Image() for each
  // then inserts (string, image) into assetMap.
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
    if (reg.y + reg.height > this.map.height) reg.y = this.map.height - reg.height;
    if (reg.x + reg.width > this.map.width) reg.x = this.map.width - reg.width;
    const terrain = this.assetMap.get('Terrain');
    for (let x = reg.x; x < reg.x + reg.width; x++) {
      for (let y = reg.y; y < reg.y + reg.width; y++) {
        this.drawImage(terrain, terrain.width, y, x, this.map.drawLayer[y][x].index);
      }
    }
  }

  // Draws Assets
  public drawAssets(yStart: number = 0, xStart: number = 0, height: number = this.map.height, width: number = this.map.width): void {
    console.log('drawAssets: ' + this.map.assets);
    for (const asset of this.map.assets) {
      const img = this.assetMap.get(asset.type);
      this.drawImage(img, img.width, asset.y, asset.x, 0);
    }
  }

  // PARMS: image, width, y, x, index
  // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
  private drawImage(image: HTMLImageElement, width: number, y: number, x: number, index: number): void {
    this.context.drawImage(image, 0, index * width, width, width, x * this.SPRITE_SIZE, y * this.SPRITE_SIZE, width, width);
  }
}
