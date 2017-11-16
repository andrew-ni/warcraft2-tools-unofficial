import { unitTypes } from 'asset';
import { readFile } from 'fs';
import { join as pathJoin } from 'path';


export class Sprite {
  private _image: ImageBitmap;
  private _path: string;
  private _index = 0; // Save index of the "inactive" frame for all structures, for drawing.
  private animations: AnimationSet[] = [];

  constructor() { }

  /**
   * Reads the .dat files for the desired asset.
   * Saves the filepath to the .png and the correct drawing index.
   * @param assetName AssetType to parse (e.g. 'Peasant')
   */
  public async readDat(assetName: string) {
    return new Promise<void>((resolve, reject) => {
      readFile('src/assets/img/' + assetName + '.dat', 'utf8', (err, data) => {
        if (err) { console.error(err); reject(err); }

        const [, relPath, , frameNames] = data.split(/#.*?\r?\n/);
        this._path = pathJoin('assets/img/', relPath.trim());

        const rawAnimations = new Map<string, SubFrame[]>();

        const frameNamesArray = frameNames.trim().split(/\r?\n/);
        for (const [i, framName] of frameNamesArray.entries()) {

          // Ex. `lumber-nw-3`
          // Group 1. `lumber`
          // Group 2. `-nw`
          // Group 3. `nw`
          // Group 4. `-3`
          // Group 5. `3`
          const match = framName.match(/\b([a-z]+)(-([a-z]+))?(-(\d+))?\b/);

          const animationName = match[1];
          const subType = match[3];
          const subIndex = (match[5] === undefined) ? 0 : parseInt(match[5], 10);

          if (!rawAnimations.has(animationName)) {
            rawAnimations.set(animationName, []);
          }

          rawAnimations.get(animationName).push({ subType, subIndex, index: i });


          if (framName.includes('inactive')) {
            this._index = i;
            break;
          }
        }

        for (const [name, subFrames] of rawAnimations) {
          const anim = new AnimationSet(name, subFrames);
          this.animations.push(anim);
          this.animations[name] = anim;
        }
        console.log(assetName, this.animations);

        resolve();
      });
    });
  }

  get image() { return this._image; }
  get path() { return this._path; }
  get index() { return this._index; }

  set image(img: ImageBitmap) { this._image = img; }
}


interface SubFrame {
  subType: string;
  subIndex: number;
  index: number;
}

export class Animation {
  constructor(
    private name: string,
    private indices: number[],
  ) { }
}

export class AnimationSet {
  private animations: Animation[] = [];

  constructor(
    private name: string,
    frames: SubFrame[]
  ) {
    const rawAnimations = new Map<string, number[]>();

    for (const frame of frames) {
      if (!rawAnimations.has(frame.subType)) {
        rawAnimations.set(frame.subType, []);
      }

      const indices = rawAnimations.get(frame.subType);
      indices.length = (frame.subIndex + 1) > indices.length ? frame.subIndex + 1 : indices.length;
      indices[frame.subIndex] = frame.index;
    }

    for (const [animationName, indices] of rawAnimations) {
      const anim = new Animation(animationName, indices);
      this.animations.push(anim);
      this.animations[animationName] = anim;
    }
  }
}
