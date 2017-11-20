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
  // private actions: Set<string>

  constructor(
    private animationService: AnimationService,
    private spriteService: SpriteService,
  ) { }

    /**
   * Updates asset based on dropdown selection
   * @param newValue the new value that the user selected from the select asset drop down menu
   */
  onChangeAsset(newValue) {
    this.animationService.setSprite(strToAsset[newValue]);
    // todo: refresh all other lists
    for (const key of this.animationService.animation.actionList){
      console.log(key);
    }
    for (const key2 of this.animationService.animation.directionList) {
      console.log(key2);
    }
    // console.log('selected asset is:', strToAsset[newValue]);
  }

  ngOnInit() {
    this.animationCanvas = document.getElementById('animationCanvas') as HTMLCanvasElement;
    this.animationContext = this.animationCanvas.getContext('2d');
    this.animationService.setCanvas(this.animationCanvas, this.animationContext);

    const notStringAssets = new Set<AssetType>([...unitTypes, ...structureTypes]);

    for (const asset of notStringAssets) {
      this.assets.add(assetToString[asset]);
    }
    console.log(notStringAssets);

  }

}
