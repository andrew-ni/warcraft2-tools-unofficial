import { Component, OnInit } from '@angular/core';
import { assetToString, AssetType, strToAsset, structureTypes, unitTypes } from 'asset';
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

  private assets: Set<string> = new Set<string>();

  constructor(
    private animationService: AnimationService,
    private spriteService: SpriteService,
  ) { }

  /**
   * Updates asset based on dropdown selection
   * @param newValue new value selected from drop down menu
   */
  onChangeAsset(newValue) {
    console.log('change asset to:', strToAsset[newValue]);
    this.animationService.setSprite(strToAsset[newValue]);
  }

  /**
   * Updates action based on dropdown selection
   * @param newValue new value selected from drop down menu
   */
  onChangeAction(newValue) {
    console.log('change action to:', newValue);
    this.animationService.animation.setAction(newValue);
  }

  /**
   * Updates direction based on dropdown selection
   * @param newValue new value selected from drop down menu
   */
  onChangeDirection(newValue) {
    console.log('change direction to:', newValue);
    this.animationService.animation.setDirection(newValue);
  }

  ngOnInit() {
    this.animationCanvas = document.getElementById('animationCanvas') as HTMLCanvasElement;
    this.animationContext = this.animationCanvas.getContext('2d');
    this.animationService.setCanvas(this.animationCanvas, this.animationContext);

    const notStringAssets = new Set<AssetType>([...unitTypes, ...structureTypes]);

    // todo: clean up asset Set to populate asset dropdown
    for (const asset of notStringAssets) {
      this.assets.add(assetToString[asset]);
    }
    console.log(notStringAssets);

  }

}
