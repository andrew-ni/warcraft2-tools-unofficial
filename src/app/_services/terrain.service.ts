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

/**
 * TerrainService contains function regarding updating terrain tiles. It
 * handles calculating transitions between tile types as well as calculating
 * rotation indices so that all tiles that are stored are smooth-edged.
 */
@Injectable()
export class TerrainService {
  private map: IMap;

  constructor(
    mapService: MapService
  ) {
    this.map = mapService;

    this.map.mapLoaded.do(() => console.log('mapLoaded:Terrain')).subscribe({
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

    /**
     * Calculates the tile index and type based on the adjacent tiles.
     * @param pos The x, y coordinate of the tile.
     */
    const calcTileIndex = (pos: Coordinate) => {
      if (pos.y < 0 || pos.x < 0 || pos.y > this.map.height - 1 || pos.x > this.map.width - 1) return;

      const UL = this.map.terrainLayer[pos.y][pos.x];
      const UR = this.map.terrainLayer[pos.y][pos.x + 1];
      const LL = this.map.terrainLayer[pos.y + 1][pos.x];
      const LR = this.map.terrainLayer[pos.y + 1][pos.x + 1];
      const tile = this.map.drawLayer[pos.y][pos.x];

      let typeIndex = (((this.map.partialBits[pos.y][pos.x] & 0x8) >> 3) |
        ((this.map.partialBits[pos.y][pos.x + 1] & 0x4) >> 1) |
        ((this.map.partialBits[pos.y + 1][pos.x] & 0x2) << 1) |
        ((this.map.partialBits[pos.y + 1][pos.x + 1] & 0x1) << 3));

      /**
       * Does some bitshift math to calculate the proper tile index.
       * @param tt The tile type to check for.
       */
      const calculateIndex = (tt: TileType) => {
        typeIndex &= (tt === UL) ? 0xF : 0xE;
        typeIndex &= (tt === UR) ? 0xF : 0xD;
        typeIndex &= (tt === LL) ? 0xF : 0xB;
        typeIndex &= (tt === LR) ? 0xF : 0x7;
        return this.map.tileSet.getIndex(tt, typeIndex, 0 /*alt*/);
      };

      /**
       * Checks if the tile type matches any in a 2x2 box.
       * If so then the tile type is applied to the tile at `pos` and the index is calculated.
       * @param tt The tile type to check for.
       */
      const CheckTileAndApplyTypeAndIndex = (tt: TileType) => {
        if (tt === UL || tt === UR || tt === LL || tt === LR) {
          tile.tileType = tt;
          tile.index = calculateIndex(tile.tileType);
          return true;
        } else return false;
      };

      if (CheckTileAndApplyTypeAndIndex(TileType.DarkGrass)) return;
      if (CheckTileAndApplyTypeAndIndex(TileType.DarkDirt)) return;
      if (CheckTileAndApplyTypeAndIndex(TileType.DeepWater)) return;
      if (CheckTileAndApplyTypeAndIndex(TileType.ShallowWater)) return;
      if (CheckTileAndApplyTypeAndIndex(TileType.Rock)) return; // TODO: Rubble?
      if (CheckTileAndApplyTypeAndIndex(TileType.Forest)) return; // TODO: Stump?
      if (CheckTileAndApplyTypeAndIndex(TileType.LightDirt)) return;

      tile.tileType = TileType.LightGrass;
      tile.index = 0xF;
    };

    // Need to additionally calculate one row above and one column to the left of changed tiles.
    reg.y--; reg.x--; reg.height++; reg.width++;

    for (let _y = reg.y; _y < reg.y + reg.height; _y++) {
      for (let _x = reg.x; _x < reg.x + reg.width; _x++) {
        calcTileIndex({ x: _x, y: _y });
      }
    }

    this.map.tilesUpdated.next(reg);
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
     * The top row indicates the current tile type.
     * The left column indicates the new tile type being placed.
     * Within a cell represents the transition sequence.
     * For example placing a ShallowWater tile (w) in a LightGrass (g) field
     * would result in a transition w[wd]g.
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
