import { unitTypes } from 'asset';
import { readFile } from 'fs';
import { join as pathJoin } from 'path';


export class Sprite {
  private _image: ImageBitmap;
  private _path: string;
  private _index = 0; // Save index of the "inactive" frame for all structures, for drawing.

  constructor() { }

  /**
   * Reads the .dat files for the desired asset.
   * Saves the filepath to the .png and the correct drawing index.
   * @param name AssetType to parse (e.g. 'Peasant')
   */
  public async readDat(name: string) {
    return new Promise<void>((resolve, reject) => {
      readFile('src/assets/img/' + name + '.dat', 'utf8', (err, data) => {
        if (err) { console.error(err); reject(err); }

        const [, relPath, , frameNames] = data.split(/#.*?\r?\n/);
        this._path = pathJoin('assets/img/', relPath.trim());

        const animations = new Map<string, number[]>();

        const frameNamesArray = frameNames.trim().split(/\r?\n/);
        for (const [i, framName] of frameNamesArray.entries()) {

          const match = framName.match(/\b(\w+(-\w+)?)(-(\d+))?\b/);
          const animationName = match[1];
          const localIndex = (match[4] === undefined) ? 0 : parseInt(match[4], 10);

          if (!animations.has(animationName)) {
            animations.set(animationName, []);
          }

          const indices = animations.get(animationName);
          indices.length = (localIndex + 1) > indices.length ? localIndex + 1 : indices.length;
          indices[localIndex] = i;

          if (framName.includes('inactive')) {
            this._index = i;
            break;
          }
        }
        console.log(name, animations);

        resolve();
      });
    });
  }

  get image() { return this._image; }
  get path() { return this._path; }
  get index() { return this._index; }

  set image(img: ImageBitmap) { this._image = img; }

}
