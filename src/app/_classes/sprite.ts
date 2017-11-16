import { unitTypes } from 'asset';

export class Sprite {
  constructor(
    private _image: ImageBitmap,
    private _path: string,
    private _defaultIndex = 0,
    private _animationSets: AnimationSet[] = [],
  ) { }

  get image() { return this._image; }
  get path() { return this._path; }
  get index() { return this._defaultIndex; }
}

export class Animation {
  constructor(
    private _name: string,
    private _indices: number[],
  ) { }

  get name() { return this._name; }
}

export class AnimationSet {
  constructor(
    private _name: string,
    private _animations: Animation[],
  ) { }

  get name() { return this._name; }
}
