import { Injectable } from '@angular/core';

import { AssetType } from 'asset';
import { Coordinate, Region } from 'interfaces';
import { MapService } from 'services/map.service';
import { SpriteService } from 'services/sprite.service';
import { Sprite } from 'sprite';

/**
 * This service deals with the displaying, drawing, erasing, and replacing single tiles of the tileset canvas on the tileset tab
 */
@Injectable()
export class TilesetService {

  /** The tileset canvas on the tileset tab */
  private canvas: HTMLCanvasElement;

  /** The context of the tileset canvas */
  private context: CanvasRenderingContext2D;

  /** The terrain sprite in the sprite mapping in SpriteService*/
  private terrainSprite: Sprite;

  /** The pixel dimensions of a square tile in our map */
  public readonly TILE_SIZE = 32;

  /** The magnification factor by which to visually magnify the canvas */
  public MULTIPLIER = 3;

  constructor(
    private spriteService: SpriteService,
    private mapService: MapService,
  ) { }

  /**
   * This function links the tileset component canvas and context with the private ones in this class
   * @param canvas The canvas that we want to link this service with
   * @param ctx The context that we want to link this service with
   */
  public setCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.context = ctx;
    this.spriteService.initializing.then(() => this.init());
  }

  /**
   * A clearer named function to trigger a tileset tab canvas redraw (private method)
   */
  public tilesetLoad() {
    this.drawCanvas();
  }

  /**
   * Initialize the canvas from the map project
   */
  private init() {
    this.mapService.mapProjectLoaded.do(() => console.log('mapLoaded:TilesetTab')).subscribe({
      next: async () => {
        await this.spriteService.init();
        this.drawCanvas();
      },
      error: err => console.error(err),
      complete: null
    });

    this.drawCanvas();
  }

  /**
   * Draws the image from the sprite mapping for AssetType.Terrain onto a canvas
   * Magnify by this.MULTIPLIER
   */
  private drawCanvas() {
    this.terrainSprite = this.spriteService.get(AssetType.Terrain);
    this.canvas.width = this.terrainSprite.image.width * this.MULTIPLIER;
    this.canvas.height = this.terrainSprite.image.height * this.MULTIPLIER;
    this.drawTerrainImg();
  }

  /**
   * Clears the canvas, then draws the Terrain sprite on our context
   */
  private drawTerrainImg() {
    this.clearCanvas();
    this.context.drawImage(this.terrainSprite.image, 0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * clears the canvas
   */
  private clearCanvas() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Replaces a single tile with a chosen image
   * @param img The imagebitmap for the image that you want to replace the single tile with
   * @param clickPos The coordinates from which we calculate the region to redraw
   */
  public replaceSingleTile(img: ImageBitmap, clickPos: Coordinate) {
    const affectedReg: Region = {
      x: 0,
      y: Math.floor(clickPos.y / (this.TILE_SIZE * this.MULTIPLIER)) * (this.TILE_SIZE * this.MULTIPLIER),
      width: this.canvas.width,
      height: this.TILE_SIZE * this.MULTIPLIER
    };
    this.drawImgOnCanvas(affectedReg, img);
  }

  /**
   * Draws the image in the specified region on the canvas
   * @param reg The region we would like to draw over on the canvas
   * @param img The imagebitmap for the image that you want to draw on the canvas
   */
  private drawImgOnCanvas(reg: Region, img: ImageBitmap) {
    this.context.drawImage(img, reg.x, reg.y, reg.width, reg.height);
  }
}
