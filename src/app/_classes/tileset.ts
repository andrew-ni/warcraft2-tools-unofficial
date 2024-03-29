import { strToTileType, TileType } from 'tile';

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

  private tileset: number[][][] = new Array();

  /**
   * Breaks terrain.dat into indices, TileTypes (according to hex), and alt tiles
   * Initializes Tileset
   * @param datStr The terrain.dat string
   */
  private parseDat(datStr: string): void {
    const [, path, numTiles, tileNames] = datStr.split(/#.*?\r?\n/g);
    const tiles = tileNames.split(/\r?\n/);

    for (const [i, row] of tiles.entries()) {
      const [, tileStr, , hex, , alt] = row.match(/(\w+(-\w+)?)-([0-9A-F]|(UK))-(\d)/);
      if (hex === 'UK') {
        continue;
      }
      const index = strToTileType[tileStr];
      if (index !== undefined) {
        this.tileset[index][parseInt(hex, 16)][parseInt(alt, 10)] = i;
      } else {
        // ERROR
      }
    }
  }

  /**
   * Returns the index (number) in tileset[][][], which determines which exact tile we use for a particular spot
   * @param tileType TileType of the tile we want
   * @param partialIndex Partial Tile we want
   * @param alt Which alternate tile we want (set to 0 unless we decide to implement alternate tiles)
   */
  getIndex(tileType: TileType, partialIndex: number, alt: number) {
    const index = this.tileset[tileType][partialIndex][alt];
    return index ? index : 0;
  }
}
