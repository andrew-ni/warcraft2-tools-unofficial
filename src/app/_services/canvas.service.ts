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
  private sprites = new Map<AssetType, ImageBitmap[]>();
  private playerColors: ImageData;

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
        this.drawMap(reg);
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
  // Finds files in /assets/img/, and replaces .dat with .png.
  // Creates Image() for each then inserts <string, image> into assetMap.
  private async loadDoseDatFiles() {
    const loadImage = async (name: string, onload: (image: HTMLImageElement, type: AssetType) => Promise<void> | void = () => { }) => {
      const tempImage = new Image();
      const imageLoaded = new Promise<void>((resolve) => {
        tempImage.onload = async () => {
          await onload(tempImage, AssetType[name]);
          this.assetMap.set(AssetType[name], tempImage);

          resolve();
        };
      });
      tempImage.src = 'assets/img/' + name + '.png';
      return imageLoaded;
    };

    await loadImage('Colors', (img) => this.initColorMap(img));

    const pendingImages: Promise<void>[] = [];

    readdir('./src/assets/img/', async (err, fileNames) => {
      for (const fileName of fileNames) {
        const { name, ext } = parse(fileName);
        if (/\.dat/i.test(ext)) {
          pendingImages.push(loadImage(name, (img, type) => this.recolorSprite(img, type)));
        }
      }
    });

    return Promise.all(pendingImages);
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
      this.context.drawImage(this.sprites.get(type)[(drawX / 128) % 8], drawX + 32, 32);
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

  private initColorMap(htmlImage: HTMLImageElement) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    canvas.width = htmlImage.width; canvas.height = htmlImage.height;
    context.drawImage(htmlImage, 0, 0);
    this.playerColors = context.getImageData(0, 0, htmlImage.width, htmlImage.height);
  }

  private async recolorSprite(htmlImage: HTMLImageElement, assetType: AssetType) {
    const [r, g, b, a] = [0, 1, 2, 4];

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    const getPixel = (img: ImageData, pos: Coordinate) => {
      return new Uint8ClampedArray(img.data.buffer, pos.y * img.width * 4 + pos.x * 4, 4);
    };

    const testAndReplacePixel = (test: Uint8ClampedArray, src: Uint8ClampedArray, dest: Uint8ClampedArray) => {
      if (test[r] === dest[r] && test[g] === dest[g] && test[b] === dest[b]) {
        dest[r] = src[r]; dest[g] = src[g]; dest[b] = src[b];
      }
    };

    const recolorToPlayer = (img: ImageData, owner: number) => {
      for (let shade = 0; shade < this.playerColors.width; shade++) {
        const testPx = getPixel(this.playerColors, { x: shade, y: 0 });
        const srcPx = getPixel(this.playerColors, { x: shade, y: owner });

        for (let y = 0; y < img.height; y++) {
          for (let x = 0; x < img.width; x++) {
            const destPx = getPixel(img, { x, y });
            testAndReplacePixel(testPx, srcPx, destPx);
          }
        }
      }
    };

    canvas.width = htmlImage.width; canvas.height = htmlImage.height;
    context.clearRect(0, 0, htmlImage.width, htmlImage.height);
    context.drawImage(htmlImage, 0, 0);
    let image = context.getImageData(0, 0, htmlImage.width, htmlImage.height);
    this.sprites.set(assetType, []);
    this.sprites.get(assetType).push(await createImageBitmap(image));

    for (let owner = 1; owner < 8; owner++) {
      image = context.getImageData(0, 0, htmlImage.width, htmlImage.height);
      recolorToPlayer(image, owner);
      this.sprites.get(assetType).push(await createImageBitmap(image));
    }
  }
}
