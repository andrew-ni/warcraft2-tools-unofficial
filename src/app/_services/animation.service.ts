import { Injectable } from '@angular/core';
import { AssetType } from 'asset';
import { ipcRenderer } from 'electron';
import { CanvasService } from 'services/canvas.service';
import { SpriteService } from 'services/sprite.service';
import { Sprite } from 'sprite';

/**
 *
 */
@Injectable()
export class AnimationService {

  /** Contains the canvas HTML element for assets */
  private animationCanvas: HTMLCanvasElement;
  private animationContext: CanvasRenderingContext2D;

  constructor(
    private spriteService: SpriteService,
  ) { }

  private init() {
    this.animationCanvas.width = 20 * 32;
    this.animationCanvas.height = 20 * 32;
    this.draw();
  }

  public setCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void {
    this.animationCanvas = canvas;
    this.animationContext = ctx;
    this.spriteService.initializing.then(() => this.init());
  }

  private draw() {
    const peasant = this.spriteService.get(AssetType.Peasant);
    CanvasService.drawImage(
      this.animationContext, peasant.image, 1, peasant.image.width, { x: 2, y: 2 }, 1);
  }
}
