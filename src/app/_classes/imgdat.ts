import { readFile } from 'fs';
import { join as pathJoin } from 'path';

/**
 * Stores all the resources within assets/img/ in an accessible map for use
 * in drawing functions.
 */
export class ImgDat {
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

        const frameNamesArray = frameNames.trim().split(/\r?\n/);

        for (const [i, framName] of frameNamesArray.entries()) {
          if (framName.includes('inactive')) {
            this._index = i;
            break;
          }
        }

        resolve();
      });
    });
  }

  get image() { return this._image; }
  get path() { return this._path; }
  get index() { return this._index; }

  set image(img: ImageBitmap) { this._image = img; }

}
