import { readFile } from 'fs';
import { join as pathJoin } from 'path';


export class ImgDat {
  public image: ImageBitmap;
  public path: string;
  public index = 0; // Save index of the "inactive" frame for all structures, for drawing.

  constructor() { }

  public async readDat(name: string) {
    return new Promise<void>((resolve, reject) => {
      readFile('src/assets/img/' + name + '.dat', 'utf8', (err, data) => {
        if (err) { console.error(err); reject(err); }

        const [, relPath, , frameNames] = data.split(/#.*?\r?\n/);
        this.path = pathJoin('assets/img/', relPath.trim());

        const frameNamesArray = frameNames.trim().split(/\r?\n/);

        for (const [i, framName] of frameNamesArray.entries()) {
          if (framName.includes('inactive')) {
            this.index = i;
            break;
          }
        }

        resolve();
      });
    });
  }
}
