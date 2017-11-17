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



  private init() {
    this.animationCanvas.width = 20 * 32;
    this.animationCanvas.height = 20 * 32;
  }

  public setCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void {
    this.animationCanvas = canvas;
    this.animationContext = ctx;
    this.init();
  }

}
