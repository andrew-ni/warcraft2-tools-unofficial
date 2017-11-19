import { unitTypes } from 'asset';

/**
 * Sprite contains all information about an Asset parsed from their `.dat`
 * files.
 */
export class Sprite {
  constructor(
    private _image: ImageBitmap,
    private _path: string,
    private _defaultIndex = 0,
    private _actions: AnimationAction[] = [],
  ) { }

  get image() { return this._image; }
  get path() { return this._path; }
  get index() { return this._defaultIndex; }
  get actions() { return this._actions; }
}

/**
 * AnimationDirection is a set of indices (in the spritesheet) for a direction
 * e.g. n, ne
 */
export class AnimationDirection {
  constructor(
    private _name: string,      // n, ne, s
    private _frames: number[], // [0,1,2]
  ) { }

  get name() { return this._name; }
  get frames() { return this._frames; }
}

/**
 * AnimationAction is sets of directional animations for an action
 * example of AnimationAction: walk, death
 *
 */
export class AnimationAction {
  constructor(
    private _name: string,    // walk, attack
    private _directions: AnimationDirection[], // [n,ne,s]
  ) { }

  get name() { return this._name; }
  get directions() { return this._directions; }
}

/**
 * Represents the state of an animation and its associated Animation objects.
 */
export class AnimationContext {
  /** The action of this current animation. */
  private action: AnimationAction;

  /** The direction of this current animation. */
  private direction: AnimationDirection;

  /**
   * Constructs a new AnimationContext. Useful for changing Sprites.
   * @param sprite The new sprite this AnimationContext should reflect.
   * @param frameNum Frame number to initialize to. Default is 0.
   */
  constructor(
    private sprite: Sprite,
    private frameNum: number = 0,
  ) {
    this.action = this.sprite.actions[0];   // default to first actionm
    this.direction = this.action.directions[0]; // default to first direction
  }

  /**
   * Set the action to the index specified.
   * @param a String or number, index of action within this Sprite to take on.
   */
  public setAction(a: string|number): void {
    this.action = this.sprite.actions[a];
    this.setDirection(0);
  }

  /**
   * Set the driection to the index specified.
   * @param a String or number, index of direction within this action to take on.
   */
  public setDirection(d: string|number): void {
    this.direction = this.action.directions[d];
  }

  /** Get the current frame number. Index in animation sprite sheet. */
  public getCurFrame(): number {
    return this.frameNum;
  }

  /** Advance to next frame and return updated frame number. */
  public nextFrame(): number {
    this.frameNum++;
    if (this.frameNum >= this.direction.frames.length) {
      this.frameNum = 0;
    }

    return this.getCurFrame();
  }

  /** Go to previous frame and return updated frame number. */
  public prevFrame(): number {
    this.frameNum--;
    if (this.frameNum < 0) {
      this.frameNum = this.direction.frames.length - 1;
    }

    return this.getCurFrame();
  }
}
