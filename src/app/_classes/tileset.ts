// interface HashTable<T> {
//   [key: string]: T;
// }

// export class Tileset {
//   constructor() {
//     this.tileset = {};
//     this.tileset['shallow-water-F-0'] = 1;
//   }

//   tileset: HashTable<number>;
// }


export class Tileset {
  constructor(datStr: string) {

  }

  tileset: number[][][];

  parseDat(datStr: string): void {
    const [, path, numTiles, tileNames] = datStr.split(/#.*?\r?\n/g);
    const tiles = tileNames.split(/\r?\n/);

    for (const [i, row] of tiles.entries()) {
      const [, tileType, , hex, , alt] = row.match(/(\w+(-\w+)?)-([0-9A-F])-(\d)/);
      if (hex === 'UK') {
        continue;
      }
      this.tileset[][parseInt(hex, 16)][parseInt(alt, 10)] = i;
    }


  }
}
