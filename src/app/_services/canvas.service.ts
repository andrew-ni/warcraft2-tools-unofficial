import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Rx';

import { Asset, AssetType } from 'asset';
import { Dimension, Region } from 'interfaces';
import { MapService } from 'services/map.service';
import { Tile } from 'tile';
import { Tileset } from 'tileset';

/**
 * Narrow IMap interface to discourage access of unrelated attributes
 */
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

/**
 * CanvasService manages drawing output of the map to the map display window.
 * It is the View component of this MVC model.
 */
@Injectable()
export class CanvasService {
  /**
   * Sprite edge length in pixels
   */
  public static readonly TERRAIN_SIZE = 32;

  /**
   * Contains the canvas HTML element for output
   */
  private canvas: HTMLCanvasElement;

  /**
   * This canvas's context
   */
  private context: CanvasRenderingContext2D;

  /**
   * Map of assets to their image elements
   */
  private assetMap = new Map<AssetType, HTMLImageElement>();

  /**
   * For accessing assets and mapping file contents
   */
  private fs;

  /**
   * Asset location
   */
  private path;

  /**
   * Map to be read from
   */
  private map: IMap;

  /**
   * Registers tilesUpdated and mapResized events, and loads dose dat files.
   * @param mapService Needs access to read from map for draw events
   */
  constructor(
    mapService: MapService,
  ) {
    this.map = mapService;
    // Load assets before, and independently of map:loaded.
    this.fs = require('fs');
    this.path = require('path');

    this.map.tilesUpdated.subscribe({
      next: reg => { this.drawMap(reg); console.log('tilesupdated'); this.drawAssets(); },
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

  /**
   * Sets canvas and context elements, initializing this CanvasService
   * @param c canvas to be set
   * @param ctx context to be set
   */
  public setCanvas(c: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void {
    this.canvas = c;
    this.context = ctx;
  }


  // TODO: read the .dat files for more information, filter readdir()
  /**
   * Finds files in /assets/img/, reads in all files .dat as .png. Creates
   * Images for them and creates a mapping in assetMap
   */
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


  /**
   * Draws map
   * @param reg Region to be drawn (default entire map)
   */
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
  /**
   * Draws assets in the region specified
   */
  public drawAssets(reg: Region = { x: 0, y: 0, width: this.map.width, height: this.map.height }): void {
    if (reg.y < 0) reg.y = 0;
    if (reg.x < 0) reg.x = 0;
    if (reg.y + reg.height > this.map.height) reg.height = this.map.height - reg.y;
    if (reg.x + reg.width > this.map.width) reg.width = this.map.width - reg.x;

    const assetsInRegion: Asset[] = [];
    for (const asset of this.map.assets) {
      if (asset.x >= reg.x - asset.width &&
          asset.x <= reg.x + reg.width &&
          asset.y >= reg.y - asset.height &&
          asset.y <= reg.y + reg.height)
      {
        assetsInRegion.push(asset);
      }
    }
    for (const asset of assetsInRegion) {
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
    this.context.drawImage(image, 0, index * width, width, width, x * CanvasService.TERRAIN_SIZE, y * CanvasService.TERRAIN_SIZE, width, width);
  }
}
