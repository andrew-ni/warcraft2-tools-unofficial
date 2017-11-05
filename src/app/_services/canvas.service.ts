import { Injectable } from '@angular/core';
import { ipcRenderer } from 'electron';
import { readdir } from 'fs';
import { parse } from 'path';
import { Subject } from 'rxjs/Rx';

import { Asset, AssetType } from 'asset';
import { Coordinate, Dimension, Region } from 'interfaces';
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
  private assetMap2 = new Map<AssetType, ImageBitmap[]>();

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
    await this.loadDoseDatFiles();
    await this.recolorAssets();

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

    this.map.tilesUpdated.do(x => console.log('tilesUpdated:Canvas: ', JSON.stringify(x))).subscribe({
      next: reg => {
        this.drawMap(reg)
        this.drawAssets();
        this.assetsService.removeInvalidAsset(reg);
      },
      error: err => console.error(err),
      complete: null
    });

    // TEMP for convenience
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


    // TEMP. Proof of concept
    const assetsToRecolor = [
      // AssetType.Archer,
      AssetType.Footman,
      // AssetType.Peasant,
      // AssetType.Ranger,
      AssetType.Barracks,
      AssetType.Blacksmith,
      // AssetType.Farm,
      AssetType.CannonTower,
      AssetType.Castle,
      AssetType.GuardTower,
      AssetType.Keep,
      AssetType.LumberMill,
      AssetType.ScoutTower,
      AssetType.TownHall,
    ];
    let drawX = 0;
    assetsToRecolor.forEach(type => {
      this.context.drawImage(this.assetMap2.get(type)[(drawX / 128) % 8], drawX + 32, 32);
      drawX += 128;
    });
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

  private async recolorAssets() {
    const [r, g, b, a] = [0, 1, 2, 4];

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    const tempColors = this.assetMap.get(AssetType.Colors);
    canvas.width = tempColors.width; canvas.height = tempColors.height;
    context.drawImage(tempColors, 0, 0);
    const colors = context.getImageData(0, 0, 4, 8);

    const getPixel = (image: ImageData, pos: Coordinate) => {
      return new Uint8ClampedArray(image.data.buffer, pos.y * image.width * 4 + pos.x * 4, 4);
    };

    const testAndReplacePixel = (test: Uint8ClampedArray, src: Uint8ClampedArray, dest: Uint8ClampedArray) => {
      if (test[r] === dest[r] && test[g] === dest[g] && test[b] === dest[b]) {
        dest[r] = src[r]; dest[g] = src[g]; dest[b] = src[b];
      }
    };

    const recolorToPlayer = (image: ImageData, owner: number) => {
      for (let shade = 0; shade < colors.width; shade++) {
        const testPx = getPixel(colors, { x: shade, y: 0 });
        const srcPx = getPixel(colors, { x: shade, y: owner });

        for (let y = 0; y < image.height; y++) {
          for (let x = 0; x < image.width; x++) {
            const destPx = getPixel(image, { x, y });
            testAndReplacePixel(testPx, srcPx, destPx);
          }
        }
      }
    };

    const recolorAsset = async (assetType: AssetType) => {
      const htmlImage = this.assetMap.get(assetType);
      canvas.width = htmlImage.width; canvas.height = htmlImage.height;
      context.clearRect(0, 0, htmlImage.width, htmlImage.height);
      context.drawImage(htmlImage, 0, 0);
      let image = context.getImageData(0, 0, htmlImage.width, htmlImage.height);
      this.assetMap2.set(assetType, []);
      this.assetMap2.get(assetType).push(await createImageBitmap(image));

      for (let owner = 1; owner < 8; owner++) {
        image = context.getImageData(0, 0, htmlImage.width, htmlImage.height);
        recolorToPlayer(image, owner);
        this.assetMap2.get(assetType).push(await createImageBitmap(image));
      }
    };

    const assetsToRecolor = [
      // AssetType.Archer,
      AssetType.Footman,
      // AssetType.Peasant,
      // AssetType.Ranger,
      AssetType.Barracks,
      AssetType.Blacksmith,
      // AssetType.Farm,
      AssetType.CannonTower,
      AssetType.Castle,
      AssetType.GuardTower,
      AssetType.Keep,
      AssetType.LumberMill,
      AssetType.ScoutTower,
      AssetType.TownHall,
    ];

    for (const assetType of assetsToRecolor) {
      await recolorAsset(assetType);
    }
  }
}
