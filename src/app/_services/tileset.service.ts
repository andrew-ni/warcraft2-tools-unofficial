import { Injectable } from '@angular/core';

import { AssetType } from 'asset';
import { Coordinate, Region } from 'interfaces';
import { SpriteService } from 'services/sprite.service';
import { Sprite } from 'sprite';

@Injectable()
export class TilesetService {

  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private terrainSprite: Sprite;
  public readonly TILE_SIZE = 32;
  public MULTIPLIER = 3;

  constructor(
    private spriteService: SpriteService,
  ) { }

  public setCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.context = ctx;
    this.spriteService.initializing.then(() => this.init());
  }

  public tilesetUpdate() {
    this.init();
  }

  private init() {
    this.terrainSprite = this.spriteService.get(AssetType.Terrain);
    this.canvas.width = this.terrainSprite.image.width * this.MULTIPLIER;
    this.canvas.height = this.terrainSprite.image.height * this.MULTIPLIER;
    this.drawTerrainImg();
  }

  private drawTerrainImg() {
    this.clearCanvas();
    this.context.drawImage(this.terrainSprite.image, 0, 0, this.canvas.width, this.canvas.height);
  }

  private clearCanvas() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  public replaceSingleTile(img: ImageBitmap, clickPos: Coordinate) {
    const affectedReg: Region = {
      x: 0,
      y: Math.floor(clickPos.y / (this.TILE_SIZE * this.MULTIPLIER)) * (this.TILE_SIZE * this.MULTIPLIER),
      width: this.canvas.width,
      height: this.TILE_SIZE * this.MULTIPLIER
    };
    this.drawImgOnCanvas(affectedReg, img);
  }

  private drawImgOnCanvas(reg: Region, img: ImageBitmap) {
    this.context.drawImage(img, reg.x, reg.y, reg.width, reg.height);
  }
}
