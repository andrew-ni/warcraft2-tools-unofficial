import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Rx';

import { Asset, AssetType } from 'asset';
import { Dimension, Region } from 'interfaces';
import { AssetsService } from 'services/assets.service';
import { MapService } from 'services/map.service';
import { TerrainService } from 'services/terrain.service';
import { UserService } from 'services/user.service';
import { Tile } from 'tile';
import { Tileset } from 'tileset';

interface IMap {
  width: number;
  height: number;
  assetLayer: Asset[][];
  drawLayer: Tile[][];
  assets: Asset[];
  tileSet: Tileset;
  mapResized: Subject<Dimension>;
  tilesUpdated: Subject<Region>;
}

@Injectable()
export class CanvasService {
  public static readonly TERRAIN_SIZE = 32; // size of a single terrain tile, in pixels
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private assetMap = new Map<AssetType, HTMLImageElement>();
  private fs;
  private path;

  private map: IMap;

  constructor(
    mapService: MapService,
    private userService: UserService,
    private terrainService: TerrainService,
    private assetService: AssetsService,
  ) {
    this.map = mapService;
    // Load assets before, and independently of map:loaded.
    this.fs = require('fs');
    this.path = require('path');

    this.map.tilesUpdated.subscribe({
       next: reg => { this.drawMap(reg); console.log('tilesupdated'); this.assetService.removeAsset(reg); this.drawAssets(); }
      ,
      error: err => console.error(err),
      complete: null
    });

    this.map.mapResized.subscribe({
      next: dim => {
        if (this.canvas) {
          this.canvas.width = dim.width * 32;
          this.canvas.height = dim.height * 32;
          console.log('Canvas Resized', dim.width, dim.height);
        }
      },
      error: error => console.error(error),
      complete: null
    });

    this.loadDoseDatFiles();
  }

  // Save canvas context from map.component.ts
  public setCanvas(c: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void {
    this.canvas = c;
    this.context = ctx;
  }


  // TODO: read the .dat files for more information, filter readdir()
  // Finds files in /assets/img/, and replaces .dat with .png.
  // Creates Image() for each then inserts <string, image> into assetMap.
  private loadDoseDatFiles() {
    const myPath = './src/assets/img/';
    const myFiles = this.fs.readdirSync(myPath);

    for (const i in myFiles) {
      if (this.path.extname(myFiles[i]) === '.dat') {
        const temp = String(myFiles[i]);
        const temp2 = temp.substring(0, temp.length - 4);

        const tempImage = new Image();
        tempImage.src = 'assets/img/' + temp2 + '.png';
        this.assetMap.set(AssetType[temp2], tempImage);
      }
    }
  }


  // Draws Map when loaded from file.
  public drawMap(reg: Region = { x: 0, y: 0, width: this.map.width, height: this.map.height }): void {
    if (reg.y < 0) reg.y = 0;
    if (reg.x < 0) reg.x = 0;
    if (reg.y + reg.height > this.map.height) reg.height = this.map.height - reg.y;
    if (reg.x + reg.width > this.map.width) reg.width = this.map.width - reg.x;
    const terrain = this.assetMap.get(AssetType.Terrain);
    for (let x = reg.x; x < reg.x + reg.width; x++) {
      for (let y = reg.y; y < reg.y + reg.width; y++) {
        this.drawImage(terrain, terrain.width, y, x, this.map.drawLayer[y][x].index);
      }
    }
  }

  // TODO: Accept Regions / individual assets to redraw
  // Draws Assets layer using Assets[] array from map.ts
  public drawAssets(): void {
    for (const asset of this.map.assets) {
      const img = this.assetMap.get(asset.type);
      this.drawImage(img, img.width, asset.y, asset.x, 0);
    }
  }

  /**
   * Used to draw terrain, units, and assets onto the canvas.
   * @param image Image stored in assetMap. Access with assetMap.get(imgName)
   * @param width Use image.width.
   * @param y Y coordinate to draw on canvas.
   * @param x X coordinate to draw on canvas.
   * @param index Position in the spritesheet. Starts at 0.
   */
  private drawImage(image: HTMLImageElement, width: number, y: number, x: number, index: number): void {
    if (width === 72) { // if it's a 1 width unit, TEMP solution
      this.context.drawImage(image, 17, 13, 50, 50, x * CanvasService.TERRAIN_SIZE, y * CanvasService.TERRAIN_SIZE, 50, 50);
    } else {
      this.context.drawImage(image, 0, index * width, width, width, x * CanvasService.TERRAIN_SIZE, y * CanvasService.TERRAIN_SIZE, width, width);
    }
  }
}
