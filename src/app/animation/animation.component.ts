import { Component, OnInit } from '@angular/core';
import { AssetType, structureTypes, unitTypes } from 'asset';
import { AnimationService } from 'services/animation.service';
import { AssetsService } from 'services/assets.service';

@Component({
  selector: 'app-animation',
  templateUrl: './animation.component.html',
  styleUrls: ['./animation.component.scss']
})
export class AnimationComponent implements OnInit {

  private animationCanvas: HTMLCanvasElement;
  private animationContext: CanvasRenderingContext2D;

  // Assets dropdown list. Created from union of units and structures.
  private assetsList = new Set<AssetType>([...unitTypes, ...structureTypes]);

  // copy enum to local variable for .html ngFor.
  private myAssetType = AssetType;

  constructor(
    private animationService: AnimationService,
  ) { }

  /**
   * Updates asset based on dropdown selection and updates state to validate the dropdowns.
   * @param newValue new value selected from drop down menu
   */
  onChangeAsset(newValue) {
    this.animationService.setSprite(Number(newValue));
    this.animationService.updateState();
  }

  /**
   * Updates action based on dropdown selection and updates state to validate the dropdowns.
   * @param newValue new value selected from drop down menu
   */
  onChangeAction(newValue) {
    this.animationService.animation.setAction(newValue);
    this.animationService.updateState();
  }

  /**
   * Updates direction based on dropdown selection and updates state to validate the dropdowns.
   * @param newValue new value selected from drop down menu
   */
  onChangeDirection(newValue) {
    this.animationService.animation.setDirection(newValue);
    this.animationService.updateState();
  }

  ngOnInit() {
    this.animationCanvas = document.getElementById('animationCanvas') as HTMLCanvasElement;
    this.animationContext = this.animationCanvas.getContext('2d');
    this.animationService.setCanvas(this.animationCanvas, this.animationContext);
  }

}
