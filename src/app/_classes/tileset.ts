import { TileType, strToTileType } from 'tile';

export class Tileset {
  constructor(datStr: string) {
    for (let i = 0; i < 8; i++) {
      this.tileset[i] = new Array(16);
      for (let j = 0; j < 16; j++) {
        this.tileset[i][j] = new Array(4);
      }
    }
    this.parseDat(datStr);
  }

  tileset: number[][][] = new Array();

  parseDat(datStr: string): void {
    const [, path, numTiles, tileNames] = datStr.split(/#.*?\r?\n/g);
    const tiles = tileNames.split(/\r?\n/);

    for (const [i, row] of tiles.entries()) {
      const [, tileStr, , hex, , alt] = row.match(/(\w+(-\w+)?)-([0-9A-F]|(UK))-(\d)/);
      if (hex === 'UK') {
        continue;
      }
      const index = strToTileType[tileStr];
      if (index) {
        this.tileset[index][parseInt(hex, 16)][parseInt(alt, 10)] = i;
      } else {
        // ERROR
      }
    }
    console.log(this.tileset);
  }
}
