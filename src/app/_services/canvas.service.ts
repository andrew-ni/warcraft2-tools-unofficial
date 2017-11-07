import { Injectable } from '@angular/core';
import { ipcRenderer } from 'electron';
import { readdir } from 'fs';
import { parse } from 'path';
import { Subject } from 'rxjs/Rx';

import { Asset, AssetType } from 'asset';
import { Coordinate, Dimension, Region } from 'interfaces';
import { AssetsService } from 'services/assets.service';
import { MapService } from 'services/map.service';
import { SpriteService } from 'services/sprite.service';
import { TerrainService } from 'services/terrain.service';
import { UserService } from 'services/user.service';
import { Tile } from 'tile';
import { Tileset } from 'tileset';

/**
 * Narrow IMap interface to discourage access of unrelated attributes
 */
interface IMap {
  width: number;
  height: number;
  drawLayer: Tile[][];
  assetLayer: Asset[][];
  assets: Asset[];
  tileSet: Tileset;
  mapResized: Subject<Dimension>;
  tilesUpdated: Subject<Region>;
  assetsUpdated: Subject<Region>;
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
  * max number of players
  */
  public static readonly MAX_PLAYERS = 8;

  /**
   * Contains the canvas HTML element for output
   */
  private canvas: HTMLCanvasElement;

  /**
   * This canvas's context
   */
  private context: CanvasRenderingContext2D;

  /**
   * Map to be read from
   */
  private map: IMap;

  /**
   * Registers tilesUpdated, assetsUpdated, and mapResized events, and loads dose dat files.
   * @param mapService Needs access to read from map for draw events
   */
  constructor(
    mapService: MapService,
    private spriteService: SpriteService,
    private assetsService: AssetsService,
    private userService: UserService,
  ) {
    this.map = mapService;
  }

  private async init() {
    await this.spriteService.init();

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
        this.assetsService.removeInvalidAsset(reg);
      },
      error: err => console.error(err),
      complete: null
    });

    this.map.assetsUpdated.do(x => console.log('assetsUpdated:Canvas: ', JSON.stringify(x))).subscribe({
      next: reg => this.drawAssets(reg),
      error: err => console.error(err),
      complete: null
    });


    // TEMP for convenience
    ipcRenderer.send('map:load', './src/assets/map/nwhr2rn.map');
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

  /**
   * Draws map
   * @param reg Region to be drawn (default entire map)
   */
  public async drawMap(reg: Region = { x: 0, y: 0, width: this.map.width, height: this.map.height }) {
    if (reg.y < 0) reg.y = 0;
    if (reg.x < 0) reg.x = 0;
    if (reg.y + reg.height > this.map.height) reg.height = this.map.height - reg.y;
    if (reg.x + reg.width > this.map.width) reg.width = this.map.width - reg.x;
    const terrain = await this.spriteService.get(AssetType.Terrain);
    for (let x = reg.x; x < reg.x + reg.width; x++) {
      for (let y = reg.y; y < reg.y + reg.width; y++) {
        this.drawImage(terrain, 1, terrain.width, y, x, this.map.drawLayer[y][x].index);
      }
    }
  }

  // TODO: Accept Regions / individual assets to redraw
  /**
   * Draws all the assets
   */
  // Draws Assets layer using Assets[] array from map.ts
  public async drawAssets(reg: Region) {

    const hashAssetMap = new Set<Asset>();
    for (let x = reg.x; x < reg.x + reg.width; x++) {
      for (let y = reg.y; y < reg.y + reg.width; y++) {
        // console.log(this.map.assetLayer[y][x] + ' found at ' + x + ' ' + y);
        const currentAsset = this.map.assetLayer[x][y];
        if (currentAsset !== undefined) {
          // console.log('hashing ' + currentAsset.type + ' at ' + x + ' ' + y);
          if (!hashAssetMap.has(currentAsset)) {
            // console.log('miss, add to hash');
            hashAssetMap.add(currentAsset);
            const img = await this.spriteService.get(currentAsset.type);

            // determine single sprite width
            let single = img.width;
            if (this.spriteService.isColored.get(currentAsset.type) === true) {
              single = img.width / CanvasService.MAX_PLAYERS; // all assets except goldmine need to have a new single width
            }
            // console.log('drawing ' + single + ' width at ' + x + ' ' + y);
            this.drawImage(img, this.userService.selectedPlayer, single, x, y, 0);
          }

        }
      }
    }
    // console.log('end drawassets');
  }

  /**
   * Used to draw terrain, units, and assets onto the canvas.
   * @param image Image stored in assetMap. Access with assetMap.get(imgName)
   * @param player Player 1 - 8. Used to calculate x offset in source image.
   * @param width Width of a single sprite on the image.
   * @param y Y coordinate to draw on canvas.
   * @param x X coordinate to draw on canvas.
   * @param index Position in the spritesheet. Used to calculate y offset in source image. Starts at 0.
   * void ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
   */
  private drawImage(image: ImageBitmap, player: number, width: number, y: number, x: number, index: number) {
    this.context.drawImage(image,
      (player - 1) * width, index * width, width, width,
      x * CanvasService.TERRAIN_SIZE, y * CanvasService.TERRAIN_SIZE, width, width
    );
    // this.context.drawImage(image, 0, index * width, width, width, x * CanvasService.TERRAIN_SIZE, y * CanvasService.TERRAIN_SIZE, width, width);
  }
}
