import { Injectable } from '@angular/core';

import { AssetType } from 'asset';
import { SpriteService } from 'services/sprite.service';
import { Sprite } from 'sprite';

@Injectable()
export class TilesetService {

  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private terrainSprite: Sprite;
  public readonly MULTIPLIER = 3;

  constructor(
    private spriteService: SpriteService,
  ) { }

  public setCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.context = ctx;
    this.spriteService.initializing.then(() => this.init());
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
}
