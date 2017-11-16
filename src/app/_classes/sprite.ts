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
