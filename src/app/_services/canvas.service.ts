import { Injectable } from '@angular/core';
import { ipcRenderer } from 'electron';
import { readdir } from 'fs';
import { parse } from 'path';
import { Subject } from 'rxjs/Rx';

import { Asset, AssetType } from 'asset';
import { Dimension, Region } from 'interfaces';
import { AssetsService } from 'services/assets.service';
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
   * Map to be read from
   */
  private map: IMap;

  /**
   * Registers tilesUpdated and mapResized events, and loads dose dat files.
   * @param mapService Needs access to read from map for draw events
   */
  constructor(
    mapService: MapService,
    private assetsService: AssetsService,
  ) {
    this.map = mapService;
  }

  private async init() {
    this.map.mapResized.do(x => console.log('mapResized:Canvas: ', JSON.stringify(x))).subscribe({
      next: dim => {
        if (this.canvas) {
          this.canvas.width = dim.width * 32;
          this.canvas.height = dim.height * 32;
        }
      },
      error: error => console.error(error),
      complete: null
    });

    await this.loadDoseDatFiles();

    this.map.tilesUpdated.do(x => console.log('tilesUpdated:Canvas: ', JSON.stringify(x))).subscribe({
      next: reg => {
        this.drawMap(reg)
        this.drawAssets();
        this.assetsService.removeInvalidAsset(reg);
      },
      error: err => console.error(err),
      complete: null
    });

    ipcRenderer.send('map:load', './src/assets/map/bay.map');
  }

  /**
   * Sets canvas and context elements, initializing this CanvasService
   * @param c canvas to be set
   * @param ctx context to be set
   */
  public setCanvas(c: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void {
    this.canvas = c;
    this.context = ctx;
    this.init();
  }


  // TODO: read the .dat files for more information, filter readdir()
  /**
   * Finds files in /assets/img/, reads in all files .dat as .png. Creates
   * Images for them and creates a mapping in assetMap
   */
  private loadDoseDatFiles() {
    const loadImage = async (name: string) => {
      const tempImage = new Image();
      const imageLoaded = new Promise<HTMLImageElement>((resolve) => {
        tempImage.onload = () => resolve(tempImage);
      });
      tempImage.src = 'assets/img/' + name + '.png';
      return imageLoaded;
    };

    return new Promise<void>((resolve, reject) => {
      readdir('./src/assets/img/', async (err, fileNames) => {
        if (err) return reject(err);

        for (const fileName of fileNames) {
          const { name, ext } = parse(fileName);
          if (/\.dat/i.test(ext)) {
            this.assetMap.set(AssetType[name], await loadImage(name));
          }
        }
        resolve();
      });
    });
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
   * Draws all the assets
   */
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
