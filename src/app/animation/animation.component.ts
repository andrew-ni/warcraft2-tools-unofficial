import { Component, OnInit } from '@angular/core';
import { AssetType } from 'asset';
import { Coordinate } from 'interfaces';
import { AnimationService } from 'services/animation.service';
import { AssetsService } from 'services/assets.service';
import { CanvasService } from 'services/canvas.service';
import { SpriteService } from 'services/sprite.service';

@Component({
  selector: 'app-animation',
  templateUrl: './animation.component.html',
  styleUrls: ['./animation.component.scss']
})
export class AnimationComponent implements OnInit {

  private animationCanvas: HTMLCanvasElement;
  private animationContext: CanvasRenderingContext2D;

  constructor(
    private animationService: AnimationService,
    private spriteService: SpriteService,
  ) { }

  ngOnInit() {
    this.animationCanvas = document.getElementById('animationCanvas') as HTMLCanvasElement;
    this.animationContext = this.animationCanvas.getContext('2d');
    this.animationService.setCanvas(this.animationCanvas, this.animationContext);
  }

}
