import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AssetType, structureTypes, unitTypes } from 'asset';
import { AnimationService } from 'services/animation.service';
import { AssetsService } from 'services/assets.service';

@Component({
  selector: 'app-animation',
  templateUrl: './animation.component.html',
  styleUrls: ['./animation.component.scss']
})
export class AnimationComponent implements OnInit {
 @ViewChild('container') containerRef: ElementRef;
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
   * Manages arrow keys pressed to move between frames.
   * @param event Key press event.
   */
  onKeyPress(event) {
    switch (event.key) {
      case 'ArrowRight' :
        this.animationService.nextFrame();
        break;
      case 'ArrowLeft' :
        this.animationService.prevFrame();
        break;
    }
  }

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

  /**
   * Focuses the element so that key presses are registered.
   */
  public focus() {
    setTimeout(() => this.containerRef.nativeElement.focus(), 0);
    console.log('focus');
  }

  fun_close() {
    document.getElementById('animationModal').setAttribute('style', 'display: none;');
  }
}
