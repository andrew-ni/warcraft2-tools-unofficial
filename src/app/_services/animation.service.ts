import { Injectable } from '@angular/core';
import { AssetType } from 'asset';
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
  private animation: AnimationContext;

  /** Interval function ID returned from setInterval. */
  private intervalFunction = undefined;

  /** Keeps track of whether double speed animation time is set. */
  private isDoubleSpeed = false;

  /** Constructs this AnimationService with SpriteService injected. */
  constructor(
    private spriteService: SpriteService,
  ) { }

  /** Initializes the canvas and dropdown buttons. */
  private init() {
    // set some dummy dimensions
    this.canvas.width = 4 * 32;
    this.canvas.height = 4 * 32;

    // set up sample AnimationContext
    this.animation = new AnimationContext(this.spriteService.get(AssetType.Peasant));
    this.animation.setAction('walk');
    this.animation.setDirection('e');
    this.draw();

    this.playAnimation();
    this.setDoubleSpeed(true);
    // this.pauseAnimation();
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
      this.animation.sprite.image.width / CanvasService.MAX_PLAYERS,
      { x: 2, y: 2},
      this.animation.getCurFrame());
  }

  /** Clears the animation canvas. */
  private clearCanvas() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  // INTERACTION FUNCTIONS
  /** Plays the animation depending on double speed state. */
  public playAnimation() {
    let delay = AnimationService.ANIMATION_DELAY;

    if (this.isDoubleSpeed) {
      delay /= 2;
    }

    this.intervalFunction = setInterval(() => {
      this.nextFrame();
    }, delay);
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
}
