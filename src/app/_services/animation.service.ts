import { Injectable } from '@angular/core';
import { AssetType, neutralAssets } from 'asset';
import { ipcRenderer } from 'electron';
import { CanvasService } from 'services/canvas.service';
import { SpriteService } from 'services/sprite.service';
import { AnimationContext, Sprite } from 'sprite';

/**
 * AnimationService drives the AnimationView component, providing access to
 * animation playback and frame selection, as well as updating the view with
 * asset action and direction information. Uses one AnimationContext to keep
 * track of current animation state.
 */
@Injectable()
export class AnimationService {
  public static readonly ANIMATION_DELAY = 250;

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
  ) { }

  /** Initializes the canvas and dropdown buttons. */
  private init() {
    // set some dummy dimensions
    this.canvas.width = 10 * 32;
    this.canvas.height = 10 * 32;

    // set up sample AnimationContext
    this.animation = new AnimationContext(this.spriteService.get(AssetType.Peasant));
    this._currentAsset = AssetType.Peasant;
    this.animation.setAction('walk');
    this.animation.setDirection('n');
    this.draw();

    this.playAnimation();
    this.setDoubleSpeed(false);
    // this.pauseAnimation();
  }

  get currentAsset() { return this._currentAsset; }
  get currentAction() { return this._currentAction; }
  get currentDirection() { return this._currentDirection; }
  get currentDelay() { return this._currentDelay; }

  public debug() {
    console.log(AssetType[this.currentAsset], this.currentAction, this.currentDirection, this.currentDelay);
  }

  /** Updates current state from AnimationContext. _currentAsset updates in setSprite().*/
  public updateState() {
    this._currentAction = this.animation.action.name;
    this._currentDirection = this.animation.direction.name;
  }

  /** Passes various HTML elements to this Service for control. */
  public setCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void {
    this.canvas = canvas;
    this.context = ctx;
    this.spriteService.initializing.then(() => this.init());
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
      neutralAssets.has(this._currentAsset) ? this.animation.sprite.image.width : this.animation.sprite.image.width / CanvasService.MAX_PLAYERS,
      { x: 2, y: 2},
      this.animation.getCurFrame());
  }

  /** Clears the animation canvas. */
  private clearCanvas() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  // INTERACTION FUNCTIONS
  /** Plays the animation depending on double speed state. */
  private playAnimation() {
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
  private pauseAnimation() {
    clearInterval(this.intervalFunction);
    this.intervalFunction = undefined;
  }

  /** Advances and draws the next frame. */
  private nextFrame() {
    this.animation.nextFrame();
    this.draw();
  }

  /** Backtracks and draws the previous frame. */
  private prevFrame() {
    this.animation.prevFrame();
    this.draw();
  }

  /**
   * Set double speed toggle. If animation is currently playing, will update
   * the animation interval and resume animating.
   * @param state True for double speed.
   */
  private setDoubleSpeed(state: boolean) {
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
}
