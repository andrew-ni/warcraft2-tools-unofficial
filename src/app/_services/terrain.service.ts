import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Rx';

import { Coordinate, Region } from 'interfaces';
import { MapService } from 'services/map.service';
import { charToTileType, Tile, TileType, TileTypeChar } from 'tile';
import { Tileset } from 'tileset';

interface IMap {
  width: number;
  height: number;
  terrainLayer: TileType[][];
  drawLayer: Tile[][];
  partialBits: Uint8Array[];
  tileSet: Tileset;
  tilesUpdated: Subject<Region>;
  mapLoaded: Subject<void>;
}

@Injectable()
export class TerrainService {
  private map: IMap;

  constructor(
    mapService: MapService
  ) {
    this.map = mapService;

    this.map.mapLoaded.subscribe({
      next: () => this.calcTileIndices(),
      error: err => console.error(err),
    });
  }

  /**
   * Calculates the tile indices within `drawLayer` for the given region based on adjacent tiles.
   * @param reg The region of the map that needs the tile indices recalculated (defaults to whole map)
   * @fires tilesUpdated With the modified region.
   */
  private calcTileIndices(reg: Region = { y: 0, x: 0, height: this.map.height, width: this.map.width }) {
    // Need to additionally calculate one row above and one column to the left of changed tiles
    reg.y--; reg.x--; reg.height++; reg.width++;

    for (let _y = reg.y; _y < reg.y + reg.height; _y++) {
      for (let _x = reg.x; _x < reg.x + reg.width; _x++) {
        this.calcTileIndex({ x: _x, y: _y });
      }
    }

    this.map.tilesUpdated.next(reg);
  }

  /**
   * Calculates the tile index based on the adjacent tiles.
   * Does not fire tilesUpdated event.
   * Do not call this function directly.
   * @param pos The x, y coordinate of the tile.
   * @throws RangeError if the coordinate given is out of bounds of the map.
   */
  private calcTileIndex(pos: Coordinate): void {
    if (pos.y < 0 || pos.x < 0 || pos.y > this.map.height - 1 || pos.x > this.map.width - 1) {
      throw RangeError('calcTileIndex OutofBounds');
    }

    const UL = this.map.terrainLayer[pos.y][pos.x];
    const UR = this.map.terrainLayer[pos.y][pos.x + 1];
    const LL = this.map.terrainLayer[pos.y + 1][pos.x];
    const LR = this.map.terrainLayer[pos.y + 1][pos.x + 1];
    const tile = this.map.drawLayer[pos.y][pos.x];

    let typeIndex = (((this.map.partialBits[pos.y][pos.x] & 0x8) >> 3) |
      ((this.map.partialBits[pos.y][pos.x + 1] & 0x4) >> 1) |
      ((this.map.partialBits[pos.y + 1][pos.x] & 0x2) << 1) |
      ((this.map.partialBits[pos.y + 1][pos.x + 1] & 0x1) << 3));

    if ((TileType.DarkGrass === UL) || (TileType.DarkGrass === UR) || (TileType.DarkGrass === LL) || (TileType.DarkGrass === LR)) {
      typeIndex &= (TileType.DarkGrass === UL) ? 0xF : 0xE;
      typeIndex &= (TileType.DarkGrass === UR) ? 0xF : 0xD;
      typeIndex &= (TileType.DarkGrass === LL) ? 0xF : 0xB;
      typeIndex &= (TileType.DarkGrass === LR) ? 0xF : 0x7;
      tile.tileType = TileType.DarkGrass;
      tile.index = this.map.tileSet.getIndex(tile.tileType, typeIndex, 0); // TODO  alt
    } else if ((TileType.DarkDirt === UL) || (TileType.DarkDirt === UR) || (TileType.DarkDirt === LL) || (TileType.DarkDirt === LR)) {
      typeIndex &= (TileType.DarkDirt === UL) ? 0xF : 0xE;
      typeIndex &= (TileType.DarkDirt === UR) ? 0xF : 0xD;
      typeIndex &= (TileType.DarkDirt === LL) ? 0xF : 0xB;
      typeIndex &= (TileType.DarkDirt === LR) ? 0xF : 0x7;
      tile.tileType = TileType.DarkDirt;
      tile.index = this.map.tileSet.getIndex(tile.tileType, typeIndex, 0); // TODO  alt
    } else if ((TileType.DeepWater === UL) || (TileType.DeepWater === UR) || (TileType.DeepWater === LL) || (TileType.DeepWater === LR)) {
      typeIndex &= (TileType.DeepWater === UL) ? 0xF : 0xE;
      typeIndex &= (TileType.DeepWater === UR) ? 0xF : 0xD;
      typeIndex &= (TileType.DeepWater === LL) ? 0xF : 0xB;
      typeIndex &= (TileType.DeepWater === LR) ? 0xF : 0x7;
      tile.tileType = TileType.DeepWater;
      tile.index = this.map.tileSet.getIndex(tile.tileType, typeIndex, 0); // TODO  alt
    } else if ((TileType.ShallowWater === UL) || (TileType.ShallowWater === UR) || (TileType.ShallowWater === LL) || (TileType.ShallowWater === LR)) {
      typeIndex &= (TileType.ShallowWater === UL) ? 0xF : 0xE;
      typeIndex &= (TileType.ShallowWater === UR) ? 0xF : 0xD;
      typeIndex &= (TileType.ShallowWater === LL) ? 0xF : 0xB;
      typeIndex &= (TileType.ShallowWater === LR) ? 0xF : 0x7;
      tile.tileType = TileType.ShallowWater;
      tile.index = this.map.tileSet.getIndex(tile.tileType, typeIndex, 0); // TODO  alt
    } else if ((TileType.Rock === UL) || (TileType.Rock === UR) || (TileType.Rock === LL) || (TileType.Rock === LR)) {
      typeIndex &= (TileType.Rock === UL) ? 0xF : 0xE;
      typeIndex &= (TileType.Rock === UR) ? 0xF : 0xD;
      typeIndex &= (TileType.Rock === LL) ? 0xF : 0xB;
      typeIndex &= (TileType.Rock === LR) ? 0xF : 0x7;
      tile.tileType = TileType.Rock;
      // tile.tileType = typeIndex ? TileType.Rock : TileType.Rubble;
      tile.index = this.map.tileSet.getIndex(tile.tileType, typeIndex, 0); // TODO  alt
    } else if ((TileType.Forest === UL) || (TileType.Forest === UR) || (TileType.Forest === LL) || (TileType.Forest === LR)) {
      typeIndex &= (TileType.Forest === UL) ? 0xF : 0xE;
      typeIndex &= (TileType.Forest === UR) ? 0xF : 0xD;
      typeIndex &= (TileType.Forest === LL) ? 0xF : 0xB;
      typeIndex &= (TileType.Forest === LR) ? 0xF : 0x7;
      if (typeIndex) {
        // tile.tileType = TileType.Forest;
        tile.index = this.map.tileSet.getIndex(tile.tileType, typeIndex, 0); // TODO  alt
      } else {
        // tile.tileType = TileType.Stump;
        // tile.index = ((TileType.Forest === UL) ? 0x1 : 0x0) | ((TileType.Forest === UR) ? 0x2 : 0x0) | ((TileType.Forest == LL) ? 0x4 : 0x0) | ((TileType.Forest == LR) ? 0x8 : 0x0);
      }
      tile.tileType = TileType.Forest;
      tile.index = this.map.tileSet.getIndex(tile.tileType, typeIndex, 0); // TODO  alt
    } else if ((TileType.LightDirt === UL) || (TileType.LightDirt === UR) || (TileType.LightDirt === LL) || (TileType.LightDirt === LR)) {
      typeIndex &= (TileType.LightDirt === UL) ? 0xF : 0xE;
      typeIndex &= (TileType.LightDirt === UR) ? 0xF : 0xD;
      typeIndex &= (TileType.LightDirt === LL) ? 0xF : 0xB;
      typeIndex &= (TileType.LightDirt === LR) ? 0xF : 0x7;
      tile.tileType = TileType.LightDirt;
      tile.index = this.map.tileSet.getIndex(tile.tileType, typeIndex, 0); // TODO  alt
    } else {
      tile.tileType = TileType.LightGrass;
      tile.index = 0xF;
    }
  }

  /**
   * Applies the given tile type to the given region.
   * Calculates the transitions needed between the new tiles and the existing tiles.
   * Recalculates the tiles indices.
   * @param tileType The tile type being applied.
   * @param reg The region to apply the tile type.
   * @fires tilesUpdated With the modified region.
   */
  public updateTiles(tileType: TileType, reg: Region) {
    // Changing a single tile in the editor actual results in a 2x2 change in the data
    reg.width++;
    reg.height++;

    for (let ypos = reg.y; ypos < reg.y + reg.height; ypos++) {
      for (let xpos = reg.x; xpos < reg.x + reg.width; xpos++) {
        this.map.terrainLayer[ypos][xpos] = tileType;
      }
    }

    const newArea = this.transitionTiles(reg);
    this.calcTileIndices(newArea);
  }

  /**
   * Applies a transition between newly placed tiles and existing tiles.
   * Assumes the given region consists of all the same tile type
   * Read wiki for more info on transitions:
   * https://github.com/UCDClassNitta/ECS160Tools/wiki/Tile-Transitions
   * @param reg The region of tiles that had their types changed.
   */
  private transitionTiles(reg: Region): Region {

    /**
     * The top row indicates the current tile type
     * The left column indicates the new tile type being placed
     * Within a cell represents the transition sequence
     * For example placing a ShallowWater tile (w) in a LightGrass (g) field
     * would result in a transition w[wd]g
     *
     * |   | d   | D    | F     | g    | G     | w    | W     | R    |
     * |---|-----|----- |-------|------|-------|------|-------|------|
     * | d | []  | []   | [g]   | []   | [g]   | []   | [w]   | []   |
     * | D | []  | []   | [dg]  | [d]  | [dg]  | [d]  | [dw]  | [d]  |
     * | F | [g] | [gd] | []    | []   | [g]   | [gd] | [gdw] | [gd] |
     * | g | []  | [d]  | []    | []   | []    | [d]  | [dw]  | [d]  |
     * | G | [g] | [gd] | [g]   | []   | []    | [gd] | [gdw] | [gd] |
     * | w | []  | [d]  | [dg]  | [d]  | [dg]  | []   | []    | [d]  |
     * | W | [w] | [wd] | [wdg] | [wd] | [wdg] | []   | []    | [wd] |
     * | R | []  | [d]  | [dg]  | [d]  | [dg]  | [d]  | [dw]  | []   |
     */
    const transitionTable: TileTypeChar[/*newTile*/][/*currentTile*/][/*iteration*/] =
      [
        [[], [], ['g'], [], ['g'], [], ['w'], []],
        [[], [], ['d', 'g'], ['d'], ['d', 'g'], ['d'], ['d', 'w'], ['d']],
        [['g'], ['g', 'd'], [], [], ['g'], ['g', 'd'], ['g', 'd', 'w'], ['g', 'd']],
        [[], ['d'], [], [], [], ['d'], ['d', 'w'], ['d']],
        [['g'], ['g', 'd'], ['g'], [], [], ['g', 'd'], ['g', 'd', 'w'], ['g', 'd']],
        [[], ['d'], ['d', 'g'], ['d'], ['d', 'g'], [], [], ['d']],
        [['w'], ['w', 'd'], ['w', 'd', 'g'], ['w', 'd'], ['w', 'd', 'g'], [], [], ['w', 'd']],
        [[], ['d'], ['d', 'g'], ['d'], ['d', 'g'], ['d'], ['d', 'w'], []],
      ];

    const tileType = this.map.terrainLayer[reg.y][reg.x];

    for (let iteration = 0; iteration < 3 /*max*/; iteration++) {
      let changed = false;

      /**
       * Applies the tile transition for a single tile by performing a look up in the transitionTable.
       * @param pos The coordinates of the tile to apply the transition to.
       */
      const applyTileTransition = (pos: Coordinate) => {
        if (pos.y < 0 || pos.x < 0 || pos.y > this.map.height || pos.x > this.map.width) return;

        const currentType = this.map.terrainLayer[pos.y][pos.x];
        const tileChar = transitionTable[tileType][currentType][iteration];
        if (tileChar) {
          this.map.terrainLayer[pos.y][pos.x] = charToTileType[tileChar];
          changed = true;
        }
      };

      /**
       * Applies tiles transition along an edge
       * @param length The length of the edge.
       * @param fx A function that takes values [0, length) and maps them to x coordinates.
       * @param fy A function that takes values [0, length) and maps them to y coordinates.
       */
      const transitionEdge = (length: number, fx: (n: number) => number, fy: (n: number) => number) => {
        for (let n = 0; n < length; n++) {
          applyTileTransition({ x: fx(n) + reg.x, y: fy(n) + reg.y });
        }
      };

      transitionEdge(reg.width + 1, (_x) => _x, () => -1); // Top
      transitionEdge(reg.height + 1, () => reg.width, (_y) => _y); // Right
      transitionEdge(reg.width + 1, (_x) => reg.width - _x - 1, () => reg.height); // Bottom
      transitionEdge(reg.height + 1, () => - 1, (_y) => reg.height - _y - 1); // Left

      reg.y--; reg.x--; reg.height += 2; reg.width += 2;
      if (!changed) break;
    }

    return reg;
  }
}
