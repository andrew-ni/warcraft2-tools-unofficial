import { Coordinate } from 'interfaces';

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
    private _isCustom: boolean,
  ) { }

  get image() { return this._image; }
  set image(i: ImageBitmap) { this._image = i; }
  get path() { return this._path; }
  get index() { return this._defaultIndex; }
  get actions() { return this._actions; }
  get isCustom() { return this._isCustom; }
  set isCustom(b: boolean) { this._isCustom = b; }

  /**
   * Sets a new image bitmap and also sets the isCustom flag to indicate that
   * this sprite needs to be saved as a custom asset on packaging.
   * @param image ImageBitmap to replace current image
   */
  public setCustomImage(image: ImageBitmap) {
    this._image = image;
    this._isCustom = true;
  }
}

/**
 * AnimationDirection contains a direction and the array of frames for that direction.
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
 * AnimationAction contains an action and the array of directions for that action.
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
 * Represents the state of an animation. Contains the current action and direction.
 */
export class AnimationContext {
  /** The action of this current animation. */
  private _action: AnimationAction;

  /** The direction of this current animation. */
  private _direction: AnimationDirection;

  /** Location of asset that owns this animation context. Only used by testmap. */
  private _coord: Coordinate = { x: 0, y: 0 };

  /**
   * Constructs a new AnimationContext. Useful for changing Sprites.
   * @param _sprite The new sprite this AnimationContext should reflect.
   * @param frameNum Frame number to initialize to. Default is 0.
   */
  constructor(
    private _sprite: Sprite,
    private frameNum: number = 0,
  ) {
    this._action = this._sprite.actions[0];   // default to first action
    this._direction = this._action.directions[0]; // default to first direction
  }

  get sprite(): Sprite { return this._sprite; }
  get action() { return this._action; }
  get direction() { return this._direction; }
  get actionList() { return this.sprite.actions; }
  get directionList() { return this._action.directions; }
  get coord() { return this._coord; }
  get gridCoord() { return { x: Math.floor(this._coord.x / 32), y: Math.floor(this._coord.y / 32)}; }
  set coord(c: Coordinate) { this._coord = c; }
  set gridCoord(c: Coordinate) { this._coord = { x: c.x * 32 , y: c.y * 32 }; console.log(this._coord); }

  /**
   * Set the action to the index specified.
   * @param a String or number, index of action within this Sprite to take on.
   */
  public setAction(a: string | number): void {
    this._action = this._sprite.actions[a];
    this.setDirection(0);
  }

  /**
   * Set the driection to the index specified.
   * @param d String or number, index of direction within this action to take on.
   */
  public setDirection(d: string | number): void {
    this._direction = this._action.directions[d];
  }

  /** Get the current frame number. Index in animation sprite sheet. */
  public getCurFrame(): number {
    return this._direction.frames[this.frameNum];
  }

  /** Advance to next frame and return updated frame number. */
  public nextFrame(): number {
    this.frameNum++;
    if (this.frameNum >= this._direction.frames.length) {
      this.frameNum = 0;
    }

    return this.getCurFrame();
  }

  /** Go to previous frame and return updated frame number. */
  public prevFrame(): number {
    this.frameNum--;
    if (this.frameNum < 0) {
      this.frameNum = this._direction.frames.length - 1;
    }

    return this.getCurFrame();
  }
}
