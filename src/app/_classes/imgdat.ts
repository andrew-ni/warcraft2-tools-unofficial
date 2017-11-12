import * as fs from 'fs';

export class ImgDat {
  constructor(datStr: string) {
    this.readDat(datStr);
  }

  public image: ImageBitmap;
  public path: string;
  public index: number; // Save index of the "inactive" frame for all structures, for drawing.

  private readDat(name: string) {
    if (name !== 'Terrain') {
      fs.readFile('src/assets/img/' + name + '.dat', 'utf8', (err: Error, data: string) => {
        if (err) {
          console.log(err);
        } else {
          const tokens = data.split(/\n/g);
          for (let i = 0; i < tokens.length; i++) {

            if (tokens[i].includes('# Path to frames')) {
              this.path = 'src/assets/img/' + tokens[i + 1].slice(2);
            }

            if (tokens[i].includes('# Frame names')) {
              for (let j = i + 1; j < tokens.length; j++) {
                if (tokens[j].includes('inactive')) {
                  this.index = (j - i - 1);
                  break;
                }
              }
            }

          }
        }
      });
    }
  }


}
