import { Injectable } from '@angular/core';
import { MapService } from 'services/map.service';
import { Region } from 'interfaces';
import { TileType, TileTypeChar, charToTileType } from 'tile';
import { MapObject } from 'map';
import { Tileset } from 'tileset';

@Injectable()
export class TerrainService {

  private map: MapObject;

  constructor(private mapService: MapService) {
    this.map = mapService.map;
  }

  // by default, calculates indices for whole map
  private calcIndices(reg: Region = { y: 0, x: 0, height: this.map.height, width: this.map.width }) {
    // Need to additionally calculate one row above and one column to the left of changed tiles
    reg.y--; reg.x--; reg.height++; reg.width++;

    for (let ypos = reg.y; ypos < reg.y + reg.height; ypos++) {
      for (let xpos = reg.x; xpos < reg.x + reg.width; xpos++) {
        this.calcIndex(ypos, xpos);
      }
    }

    this.mapService.tilesUpdated.next(reg);
  }

  // calcTiles() calculates tile orientation based on surrounding tiles
  // This is the function that writes the proper index into the tiles
  private calcIndex(y = 0, x = 0): void {
    if (y < 0 || x < 0 || y > this.mapService.map.height - 1 || x > this.mapService.map.width - 1) return;

    const UL = this.mapService.map.terrainLayer[y][x];
    const UR = this.mapService.map.terrainLayer[y][x + 1];
    const LL = this.mapService.map.terrainLayer[y + 1][x];
    const LR = this.mapService.map.terrainLayer[y + 1][x + 1];
    const tile = this.mapService.map.drawLayer[y][x];

    let typeIndex = (((this.mapService.map.partialBits[y][x] & 0x8) >> 3) |
      ((this.mapService.map.partialBits[y][x + 1] & 0x4) >> 1) |
      ((this.mapService.map.partialBits[y + 1][x] & 0x2) << 1) |
      ((this.mapService.map.partialBits[y + 1][x + 1] & 0x1) << 3));

    if ((TileType.DarkGrass === UL) || (TileType.DarkGrass === UR) || (TileType.DarkGrass === LL) || (TileType.DarkGrass === LR)) {
      typeIndex &= (TileType.DarkGrass === UL) ? 0xF : 0xE;
      typeIndex &= (TileType.DarkGrass === UR) ? 0xF : 0xD;
      typeIndex &= (TileType.DarkGrass === LL) ? 0xF : 0xB;
      typeIndex &= (TileType.DarkGrass === LR) ? 0xF : 0x7;
      tile.tileType = TileType.DarkGrass;
      tile.index = this.mapService.map.tileSet.getIndex(tile.tileType, typeIndex, 0); // TODO  alt
    } else if ((TileType.DarkDirt === UL) || (TileType.DarkDirt === UR) || (TileType.DarkDirt === LL) || (TileType.DarkDirt === LR)) {
      typeIndex &= (TileType.DarkDirt === UL) ? 0xF : 0xE;
      typeIndex &= (TileType.DarkDirt === UR) ? 0xF : 0xD;
      typeIndex &= (TileType.DarkDirt === LL) ? 0xF : 0xB;
      typeIndex &= (TileType.DarkDirt === LR) ? 0xF : 0x7;
      tile.tileType = TileType.DarkDirt;
      tile.index = this.mapService.map.tileSet.getIndex(tile.tileType, typeIndex, 0); // TODO  alt
    } else if ((TileType.DeepWater === UL) || (TileType.DeepWater === UR) || (TileType.DeepWater === LL) || (TileType.DeepWater === LR)) {
      typeIndex &= (TileType.DeepWater === UL) ? 0xF : 0xE;
      typeIndex &= (TileType.DeepWater === UR) ? 0xF : 0xD;
      typeIndex &= (TileType.DeepWater === LL) ? 0xF : 0xB;
      typeIndex &= (TileType.DeepWater === LR) ? 0xF : 0x7;
      tile.tileType = TileType.DeepWater;
      tile.index = this.mapService.map.tileSet.getIndex(tile.tileType, typeIndex, 0); // TODO  alt
    } else if ((TileType.ShallowWater === UL) || (TileType.ShallowWater === UR) || (TileType.ShallowWater === LL) || (TileType.ShallowWater === LR)) {
      typeIndex &= (TileType.ShallowWater === UL) ? 0xF : 0xE;
      typeIndex &= (TileType.ShallowWater === UR) ? 0xF : 0xD;
      typeIndex &= (TileType.ShallowWater === LL) ? 0xF : 0xB;
      typeIndex &= (TileType.ShallowWater === LR) ? 0xF : 0x7;
      tile.tileType = TileType.ShallowWater;
      tile.index = this.mapService.map.tileSet.getIndex(tile.tileType, typeIndex, 0); // TODO  alt
    } else if ((TileType.Rock === UL) || (TileType.Rock === UR) || (TileType.Rock === LL) || (TileType.Rock === LR)) {
      typeIndex &= (TileType.Rock === UL) ? 0xF : 0xE;
      typeIndex &= (TileType.Rock === UR) ? 0xF : 0xD;
      typeIndex &= (TileType.Rock === LL) ? 0xF : 0xB;
      typeIndex &= (TileType.Rock === LR) ? 0xF : 0x7;
      tile.tileType = TileType.Rock;
      // tile.tileType = typeIndex ? TileType.Rock : TileType.Rubble;
      tile.index = this.mapService.map.tileSet.getIndex(tile.tileType, typeIndex, 0); // TODO  alt
    } else if ((TileType.Forest === UL) || (TileType.Forest === UR) || (TileType.Forest === LL) || (TileType.Forest === LR)) {
      typeIndex &= (TileType.Forest === UL) ? 0xF : 0xE;
      typeIndex &= (TileType.Forest === UR) ? 0xF : 0xD;
      typeIndex &= (TileType.Forest === LL) ? 0xF : 0xB;
      typeIndex &= (TileType.Forest === LR) ? 0xF : 0x7;
      if (typeIndex) {
        // tile.tileType = TileType.Forest;
        tile.index = this.mapService.map.tileSet.getIndex(tile.tileType, typeIndex, 0); // TODO  alt
      } else {
        // tile.tileType = TileType.Stump;
        // tile.index = ((TileType.Forest === UL) ? 0x1 : 0x0) | ((TileType.Forest === UR) ? 0x2 : 0x0) | ((TileType.Forest == LL) ? 0x4 : 0x0) | ((TileType.Forest == LR) ? 0x8 : 0x0);
      }
      tile.tileType = TileType.Forest;
      tile.index = this.mapService.map.tileSet.getIndex(tile.tileType, typeIndex, 0); // TODO  alt
    } else if ((TileType.LightDirt === UL) || (TileType.LightDirt === UR) || (TileType.LightDirt === LL) || (TileType.LightDirt === LR)) {
      typeIndex &= (TileType.LightDirt === UL) ? 0xF : 0xE;
      typeIndex &= (TileType.LightDirt === UR) ? 0xF : 0xD;
      typeIndex &= (TileType.LightDirt === LL) ? 0xF : 0xB;
      typeIndex &= (TileType.LightDirt === LR) ? 0xF : 0x7;
      tile.tileType = TileType.LightDirt;
      tile.index = this.mapService.map.tileSet.getIndex(tile.tileType, typeIndex, 0); // TODO  alt
    } else {
      tile.tileType = TileType.LightGrass;
      tile.index = 0xF;
    }
  }

  // updateTiles() is the public function to call when applying a brush to the map (edit operation)
  // updateTiles will:
  // 1. update the "brushed" reg with the selected tile type (bringing the map to an invalid state, with invalid transitions)
  // 2. transition the tiles that were affected (bringing map to a valid state)
  // 3. call calcTiles() on the affected region
  // 4. emit the affected region so that mapService can redraw
  public updateTiles(tileType: TileType, reg: Region) {
    // Changing a single tile in the editor actual results in a 2x2 change in the data
    reg.width++;
    reg.height++;

    for (let ypos = reg.y; ypos < reg.y + reg.height; ypos++) {
      for (let xpos = reg.x; xpos < reg.x + reg.width; xpos++) {
        this.mapService.map.terrainLayer[ypos][xpos] = tileType;   // set tiletype
      }
    }

    const newArea = this.transitionTiles(tileType, reg);
    this.calcIndices(newArea);    // NOTE: might need to change this if we need to print that extra border
  }

  // transitionTiles() transitions affected tiles (passed in) based on surrounding tiles
  private transitionTiles(tileType: TileType, reg: Region): Region {

    // The top row indicates the current tile type
    // The left column indicates the new tile type being placed
    // Within a cell represents the transition sequence
    // For example placing a ShallowWater tile (w) in a LightGrass field
    // would result in a transition w[wd]g
    // Read wiki for more info on transitions:
    // https://github.com/UCDClassNitta/ECS160Tools/wiki/Tile-Transitions
    /*
    |   | d   | D    | F     | g    | G     | w    | W     | R    |
    |---|-----|----- |-------|------|-------|------|-------|------|
    | d | []  | []   | [g]   | []   | [g]   | []   | [w]   | []   |
    | D | []  | []   | [dg]  | [d]  | [dg]  | [d]  | [dw]  | [d]  |
    | F | [g] | [gd] | []    | []   | [g]   | [gd] | [gdw] | [gd] |
    | g | []  | [d]  | []    | []   | []    | [d]  | [dw]  | [d]  |
    | G | [g] | [gd] | [g]   | []   | []    | [gd] | [gdw] | [gd] |
    | w | []  | [d]  | [dg]  | [d]  | [dg]  | []   | []    | [d]  |
    | W | [w] | [wd] | [wdg] | [wd] | [wdg] | []   | []    | [wd] |
    | R | []  | [d]  | [dg]  | [d]  | [dg]  | [d]  | [dw]  | []   |
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

    for (let iteration = 0; iteration < 3 /*max*/; iteration++) {
      let changed = false;

      const applyTileTransition = (_x: number, _y: number) => {
        if (_y < 0 || _x < 0 || _y > this.map.height || _x > this.map.width) {
          return;
        }

        const currentType = this.map.terrainLayer[_y][_x];
        const tileChar = transitionTable[tileType][currentType][iteration];
        if (tileChar) {
          this.map.terrainLayer[_y][_x] = charToTileType[tileChar];
          changed = true;
        }
      };

      const transitionEdge = (length: number, fx: (n: number) => number, fy: (n: number) => number) => {
        for (let n = 0; n < length; n++) {
          applyTileTransition(fx(n) + reg.x, fy(n) + reg.y);
        }
      };

      // TODO: bound checking
      transitionEdge(reg.width + 1, (_x) => _x, () => -1); // Top
      transitionEdge(reg.height + 1, () => reg.width, (_y) => _y); // Right
      transitionEdge(reg.width + 1, (_x) => reg.width - _x - 1, () => reg.height); // Bottom
      transitionEdge(reg.height + 1, () => - 1, (_y) => reg.height - _y - 1); // Left

      reg.y--; reg.x--; reg.height += 2; reg.width += 2;
      if (!changed) break;
    }

    return reg;
  }

  public setTileSet(terrainData: string): void {
    this.map.tileSet = new Tileset(terrainData);
    this.calcIndices();
  }
}
