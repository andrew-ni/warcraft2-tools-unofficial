import { Injectable } from '@angular/core';
import { ipcRenderer } from 'electron';
import { readdir } from 'fs';
import { parse } from 'path';
import { Subject } from 'rxjs/Rx';

import { Asset, AssetType, neutralAssets } from 'asset';
import { Coordinate, Dimension, Region } from 'interfaces';
import { AssetsService } from 'services/assets.service';
import { MapService } from 'services/map.service';
import { SpriteService } from 'services/sprite.service';
import { UserService } from 'services/user.service';
import { Tile } from 'tile';
import { Tileset } from 'tileset';

/**
 * Narrow IMap interface to discourage access of unrelated attributes
 */
interface IMap {
  width: number;
  height: number;
  assets: Asset[];
  drawLayer: Tile[][];
  assetLayer: Asset[][];
  tileSet: Tileset;
  mapResized: Subject<Dimension>;
  tilesUpdated: Subject<Region>;
  assetsUpdated: Subject<Region>;
  assetRemoved: Subject<Region>;
}

/**
 * CanvasService manages drawing output of the map to the map display window.
 * It is the View component of this MVC model.
 */
@Injectable()
export class CanvasService {
  /** Sprite edge length in pixels */
  public static readonly TERRAIN_SIZE = 32;

  /** max number of players */
  public static readonly MAX_PLAYERS = 8;

  /** Contains the canvas HTML element for terrain */
  private terrainCanvas: HTMLCanvasElement;

  /** Contains the canvas HTML element for assets */
  private assetCanvas: HTMLCanvasElement;

  /** This canvas's context */
  private terrainContext: CanvasRenderingContext2D;
  private assetContext: CanvasRenderingContext2D;

  /** Map to be read from */
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

  /**
   * Initializes the events and spriteService.
   * This must be done in separate function from the constructor
   * because it is asynchronous. The spriteService needs to be
   * Initialized before subscribing to the events.
   */
  private async init() {
    await this.spriteService.init();

    this.map.mapResized.do(x => console.log('mapResized:Canvas: ', JSON.stringify(x))).subscribe({
      next: dim => {
        this.terrainCanvas.width = dim.width * 32;
        this.terrainCanvas.height = dim.height * 32;
        this.assetCanvas.width = dim.width * 32;
        this.assetCanvas.height = dim.height * 32;
      },
      error: error => console.error(error),
      complete: null
    });

    this.map.tilesUpdated.do(x => console.log('tilesUpdated:Canvas: ', JSON.stringify(x))).subscribe({
      next: async reg => {
        await this.drawMap(reg);
        this.assetsService.removeInvalidAsset(reg, false);
        this.drawAssets(reg);
      },
      error: err => console.error(err),
      complete: null
    });

    this.map.assetsUpdated.do(x => console.log('assetsUpdated:Canvas: ', JSON.stringify(x))).subscribe({
      next: reg => this.drawAssets(reg),
      error: err => console.error(err),
      complete: null
    });

    this.map.assetRemoved.do(x => console.log('assetRemoved:Canvas: ', JSON.stringify(x))).subscribe({
      next: reg => this.clearRegion(this.assetContext, reg),
      error: err => console.error(err),
      complete: null
    });



    // TEMP for convenience
    ipcRenderer.send('map:load', './src/assets/map/nwhr2rn.map');
  }

  /**
   * A generic function to delete the region in a canvas
   * @param ctx The canvas we want to clear
   * @param reg The region we want to clear
   */
  public clearRegion(ctx: CanvasRenderingContext2D, reg: Region) {
    ctx.clearRect(
      reg.x * CanvasService.TERRAIN_SIZE,
      reg.y * CanvasService.TERRAIN_SIZE,
      reg.width * CanvasService.TERRAIN_SIZE,
      reg.height * CanvasService.TERRAIN_SIZE
    );
  }

  /**
   * Sets canvas and context elements, initializing this CanvasService
   * @param terrainCanvas canvas element for drawing terrain
   * @param terrainCtx context for terrain
   * @param assetCanvas canvas element for drawing assets
   * @param assetCtx context for assets
   */
  public setCanvases(terrainCanvas: HTMLCanvasElement, terrainCtx: CanvasRenderingContext2D, assetCanvas: HTMLCanvasElement, assetCtx: CanvasRenderingContext2D): void {
    this.terrainCanvas = terrainCanvas;
    this.terrainContext = terrainCtx;
    this.assetCanvas = assetCanvas;
    this.assetContext = assetCtx;
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
    for (let y = reg.y; y < reg.y + reg.height; y++) {
      for (let x = reg.x; x < reg.x + reg.width; x++) {
        this.drawImage(this.terrainContext, terrain, 0, terrain.width, { x, y }, this.map.drawLayer[y][x].index);
      }
    }
  }

  /**
   * Draws assets in the region specified. Uses a hashset to ensure an asset is only drawn once.
   * Determines correct "slice" to draw from recolorized spritesheet based on owner.
   * @param reg Region containing assets to be drawn (default entire map)
   */
  public async drawAssets(reg: Region = { x: 0, y: 0, width: this.map.width, height: this.map.height }) {
    if (reg.y < 0) reg.y = 0;
    if (reg.x < 0) reg.x = 0;
    if (reg.x + reg.width > this.map.width) reg.width = this.map.width - reg.x;
    if (reg.y + reg.height > this.map.height) reg.height = this.map.height - reg.y;

    const hashSet = new Set<Asset>();
    for (let y = reg.y; y < reg.y + reg.height; y++) {
      for (let x = reg.x; x < reg.x + reg.width; x++) {
        const currentAsset = this.map.assetLayer[y][x];
        // only draw on hash miss (first time only)
        if (currentAsset && !hashSet.has(currentAsset)) {
          hashSet.add(currentAsset);
          const img = await this.spriteService.get(currentAsset.type);
          let single = img.width;

          if (!neutralAssets.has(currentAsset.type)) { single = img.width / CanvasService.MAX_PLAYERS; }
          this.drawImage(this.assetContext, img, currentAsset.owner, single, { x: currentAsset.x, y: currentAsset.y }, 0);
        }
      }
    }
  }
/**
 * This updates the html element in mapcomponent.html/scss to draw a box around the selected region
 * @param selectionBox the div element of the selectionbox to update
 * @param reg the region of the mouse drag to put the box around (in tile coords)
 */
  public drawSelectionBox(selectionBox: HTMLDivElement, reg: Region) {
    // if (reg.width === 0 || reg.height === 0) {
    //    selectionBox.parentElement.removeChild(selectionBox);
    //   } else {
      selectionBox.style.position = 'relative';
      selectionBox.style.border = 'dotted black 5px';
      selectionBox.style.top = (String(reg.y * CanvasService.TERRAIN_SIZE) + 'px');
      selectionBox.style.left = (String(reg.x * CanvasService.TERRAIN_SIZE) + 'px');
      selectionBox.style.width = (String(reg.width * CanvasService.TERRAIN_SIZE) + 'px');
      selectionBox.style.height = (String(reg.height * CanvasService.TERRAIN_SIZE) + 'px');
//    }
  }
  /**
   * Used to draw terrain, units, and assets onto the canvas.
   * @param layer The canvas context to draw on.
   * @param image Image stored in assetMap. Access with assetMap.get(imgName)
   * @param player Player 1 - 8. Used to calculate x offset in source image.
   * @param width Width of a single sprite on the image.
   * @param pos X, Y coordinate to draw on canvas.
   * @param index Position in the spritesheet. Used to calculate y offset in source image. Starts at 0.
   * void ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
   */
  private drawImage(layer: CanvasRenderingContext2D, image: ImageBitmap, player: number, width: number, pos: Coordinate, index: number) {
    let offset = 0;
    if (width % CanvasService.TERRAIN_SIZE !== 0) {
      offset = (width - CanvasService.TERRAIN_SIZE) / 2;
    }
    // Allows neutral units (owner 0) to be drawn correctly. Corrects spritesheet access, doesn't touch actual asset data.
    if (player === 0) { player = 1; }
    layer.drawImage(
      image,
      (player - 1) * width,
      index * width,
      width,
      width,
      pos.x * CanvasService.TERRAIN_SIZE - offset,
      pos.y * CanvasService.TERRAIN_SIZE - offset,
      width,
      width
    );
  }
}
