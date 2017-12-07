import { Injectable } from '@angular/core';
import { AssetType, neutralAssets } from 'asset';
import { Edit } from 'interfaces';
import { CanvasService } from 'services/canvas.service';
import { MapService } from 'services/map.service';
import { SpriteService } from 'services/sprite.service';
import { AnimationContext } from 'sprite';

/**
 * AnimationService drives the AnimationView component, providing access to
 * animation playback and frame selection, as well as updating the view with
 * asset action and direction information. Uses one AnimationContext to keep
 * track of current animation state.
 */
@Injectable()
export class AnimationService {
  public static readonly ANIMATION_DELAY = 200;

  /** Contains the canvas HTML element. */
  private canvas: HTMLCanvasElement;

  /** Contains the CanvasContext HTML element. */
  private context: CanvasRenderingContext2D;

  /** Current animation context to reflect on screen. */
  public animation: AnimationContext;

  /** Interval function ID returned from setInterval. */
  private intervalFunction = undefined;

  /** Keeps track of whether double speed animation time is set. */
  private isDoubleSpeed = false;

  /** Keeps track of current state of the animation canvas. Intialized with defaults. */
  private _currentAsset: AssetType = AssetType.Peasant;
  private _currentAction = 'walk';
  private _currentDirection = 'n';
  private _currentDelay: number;

  /** Constructs this AnimationService with SpriteService injected. */
  constructor(
    private spriteService: SpriteService,
    private mapService: MapService,
  ) { }

  /** Initializes the canvas with default values. */
  private init() {
    this.canvas.width = 10 * 32;
    this.canvas.height = 10 * 32;

    this.animation = new AnimationContext(this.spriteService.get(AssetType.Peasant));
    this._currentAsset = AssetType.Peasant;
    this.animation.setAction('walk');
    this.animation.setDirection('n');
    this.draw();

    this.playAnimation();
    this.setDoubleSpeed(false);
  }

  get currentAsset() { return this._currentAsset; }
  get currentAction() { return this._currentAction; }
  get currentDirection() { return this._currentDirection; }
  get currentDelay() { return this._currentDelay; }

  /** Updates current state from AnimationContext. _currentAsset updates in setSprite().*/
  public updateState() {
    this._currentAction = this.animation.action.name;
    this._currentDirection = this.animation.direction.name;
    this.draw();
  }

  /** Passes various HTML elements to this Service for control. */
  public setCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void {
    this.canvas = canvas;
    this.context = ctx;
    this.mapService.mapProjectLoaded.first().subscribe(() => this.init());
    
  }

  /**
   * Draws the current frame to the screen. Intended to be called after any
   * updates or timer interrupts.
   */
  private draw() {
    this.clearCanvas();
    CanvasService.drawImage(
      this.context,
      this.animation.sprite.image, 1,
      neutralAssets.has(this._currentAsset) ? this.animation.sprite.image.width : this.animation.sprite.image.width / MapService.MAX_PLAYERS,
      { x: 4, y: 4 },
      this.animation.getCurFrame());
  }

  /** Clears the animation canvas. */
  private clearCanvas() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  // INTERACTION FUNCTIONS
  /** Plays the animation depending on double speed state. */
  public playAnimation() {
    if (this.intervalFunction === undefined) {      // do not play if already playing
      let delay = AnimationService.ANIMATION_DELAY;
      if (this.isDoubleSpeed) {       // half delay time if double speed s et
        delay /= 2;
      }
      this._currentDelay = delay;

      this.intervalFunction = setInterval(() => {
        this.nextFrame();
      }, delay);
    }
  }

  /** Pauses the animation. */
  public pauseAnimation() {
    clearInterval(this.intervalFunction);
    this.intervalFunction = undefined;
  }

  /** Advances and draws the next frame. */
  public nextFrame() {
    this.animation.nextFrame();
    this.draw();
  }

  /** Backtracks and draws the previous frame. */
  public prevFrame() {
    this.animation.prevFrame();
    this.draw();
  }

  /**
   * Set double speed toggle. If animation is currently playing, will update
   * the animation interval and resume animating.
   * @param state True for double speed.
   */
  public setDoubleSpeed(state: boolean) {
    this.isDoubleSpeed = state;

    if (this.intervalFunction !== undefined) {    // if animation IS PLAYING
      this.pauseAnimation();
      this.playAnimation();
    }
  }

  /**
   * Replaces current AnimationContext with a new one based on passed sprite/asset.
   * @param asset Asset to change to.
   */
  public setSprite(asset: AssetType) {
    console.log('setSprite to:', asset);
    this.animation = new AnimationContext(this.spriteService.get(asset));
    this._currentAsset = asset;
    this.draw();
  }

  /**
   * Called every time the user modifies a frame of an animation.
   * Creates a canvas, draws the before image, edits, and saves the result to the sprite map in sprite service.
   * @param change Edit distance of the sprite. Values are coded in 1 pixel increments from the html buttons.
   */
  private async editSprite(change: Edit) {
    const index = this.animation.getCurFrame();
    const image = this.animation.sprite.image;
    const width = neutralAssets.has(this._currentAsset) ? image.width : image.width / MapService.MAX_PLAYERS;

    const editCanvas = document.createElement('canvas');
    const editContext = editCanvas.getContext('2d');

    editCanvas.width = image.width;
    editCanvas.height = image.height;
    editContext.drawImage(image, 0, 0);

    editContext.clearRect(0, index * width, width * MapService.MAX_PLAYERS, width);
    editContext.drawImage(image, 0, index * width, width * MapService.MAX_PLAYERS, width,
      change.dx, index * width + change.dy, width * MapService.MAX_PLAYERS, width);

    const result: ImageBitmap = await createImageBitmap(editContext.getImageData(0, 0, image.width, image.height));
    this.animation.sprite.setCustomImage(result);

    this.draw();
  }

  /** Resets the sprite in memory by refreshing its ImageBitmap, and resets isCustom to false. */
  private async resetSprite() {
    await this.spriteService.reset(this._currentAsset);
    this.animation.sprite.isCustom = false;
    this.draw();
  }
}
