import { TileType, Tile, numToTileType, strToTileType, numToChar, charToTileType, TileTypeChar } from './tile';
import { Player } from './player';
import { Asset } from './asset';
import { Tileset } from './tileset';

export class Map {

  // Headers are for stringify(), which needs them to output map comments
  static NAME_HEADER = '# Map Name';
  static DIMENSION_HEADER = '# Map Dimensions W x H';
  static TERRAIN_HEADER = '# Map Terrain Data';
  static PARTIAL_BITS_HEADER = '# Map Partial Bits';
  static PLAYER_NUM_HEADER = '# Number of players';
  static PLAYER_RESOURCES_HEADER = '# Starting resources Player Gold Lumber';
  static ASSET_NUM_HEADER = '# Number of assets';
  static ASSET_DETAIL_HEADER = '# Starting assets Type Owner X Y';
  static AI_NUM_HEADER = '# Number of scripts';
  static AI_SCRIPTS_HEADER = '# AI Scripts';

  // map status flags
  canSave: boolean;

  // map detail fields
  name: string;
  width: number;
  height: number;
  mapLayer1: Tile[][];
  partialBits: number[][];
  players: Player[] = [];
  assets: Asset[] = [];

  // `mapData` is the raw file contents
  constructor(mapData: string) {
    this.canSave = false;       // save state is not ready yet
    this.parseMapData(mapData);
    this.iterateCalc();
  }

  // by default, calculates indices for whole map
  // note: nitta's map is rendered [y][x], so we should match him for consistency TODO
  public iterateCalc(x = 0, y = 0, w = this.width, h = this.height) {
    for (let xpos = x; xpos < w; xpos++) {
      for (let ypos = y; ypos < h; ypos++) {
        this.calcTiles(xpos, ypos);
      }
    }
  }

  private calcTiles(y = 0, x= 0): void {
    const UL = this.mapLayer1[y][x].tileType;
    const UR = this.mapLayer1[y][x + 1].tileType;
    const LL = this.mapLayer1[y + 1][x].tileType;
    const LR = this.mapLayer1[y + 1][x + 1].tileType;

    let typeIndex = (((this.partialBits[y][x] & 0x8) >> 3) |
      ((this.partialBits[y][x + 1] & 0x4) >> 1) |
      ((this.partialBits[y + 1][x] & 0x2) << 1) |
      ((this.partialBits[y + 1][x + 1] & 0x1) << 3));

    if ((TileType.DarkGrass === UL) || (TileType.DarkGrass === UR) || (TileType.DarkGrass === LL) || (TileType.DarkGrass === LR)) {
      typeIndex &= (TileType.DarkGrass === UL) ? 0xF : 0xE;
      typeIndex &= (TileType.DarkGrass === UR) ? 0xF : 0xD;
      typeIndex &= (TileType.DarkGrass === LL) ? 0xF : 0xB;
      typeIndex &= (TileType.DarkGrass === LR) ? 0xF : 0x7;
      this.mapLayer1[y][x].tileType = TileType.DarkGrass;
      this.mapLayer1[y][x].index = typeIndex;
    } else if ((TileType.DarkDirt === UL) || (TileType.DarkDirt === UR) || (TileType.DarkDirt === LL) || (TileType.DarkDirt === LR)) {
      typeIndex &= (TileType.DarkDirt === UL) ? 0xF : 0xE;
      typeIndex &= (TileType.DarkDirt === UR) ? 0xF : 0xD;
      typeIndex &= (TileType.DarkDirt === LL) ? 0xF : 0xB;
      typeIndex &= (TileType.DarkDirt === LR) ? 0xF : 0x7;
      this.mapLayer1[y][x].tileType = TileType.DarkDirt;
      this.mapLayer1[y][x].index = typeIndex;
    } else if ((TileType.DeepWater === UL) || (TileType.DeepWater === UR) || (TileType.DeepWater === LL) || (TileType.DeepWater === LR)) {
      typeIndex &= (TileType.DeepWater === UL) ? 0xF : 0xE;
      typeIndex &= (TileType.DeepWater === UR) ? 0xF : 0xD;
      typeIndex &= (TileType.DeepWater === LL) ? 0xF : 0xB;
      typeIndex &= (TileType.DeepWater === LR) ? 0xF : 0x7;
      this.mapLayer1[y][x].tileType = TileType.DeepWater;
      this.mapLayer1[y][x].index = typeIndex;
    } else if ((TileType.ShallowWater === UL) || (TileType.ShallowWater === UR) || (TileType.ShallowWater === LL) || (TileType.ShallowWater === LR)) {
      typeIndex &= (TileType.ShallowWater === UL) ? 0xF : 0xE;
      typeIndex &= (TileType.ShallowWater === UR) ? 0xF : 0xD;
      typeIndex &= (TileType.ShallowWater === LL) ? 0xF : 0xB;
      typeIndex &= (TileType.ShallowWater === LR) ? 0xF : 0x7;
      this.mapLayer1[y][x].tileType = TileType.ShallowWater;
      this.mapLayer1[y][x].index = typeIndex;
    } else if ((TileType.Rock === UL) || (TileType.Rock === UR) || (TileType.Rock === LL) || (TileType.Rock === LR)) {
      typeIndex &= (TileType.Rock === UL) ? 0xF : 0xE;
      typeIndex &= (TileType.Rock === UR) ? 0xF : 0xD;
      typeIndex &= (TileType.Rock === LL) ? 0xF : 0xB;
      typeIndex &= (TileType.Rock === LR) ? 0xF : 0x7;
      this.mapLayer1[y][x].tileType = TileType.Rock;
      // this.mapLayer1[y][x].tileType = typeIndex ? TileType.Rock : TileType.Rubble;
      this.mapLayer1[y][x].index = typeIndex;
    } else if ((TileType.Forest === UL) || (TileType.Forest === UR) || (TileType.Forest === LL) || (TileType.Forest === LR)) {
      typeIndex &= (TileType.Forest === UL) ? 0xF : 0xE;
      typeIndex &= (TileType.Forest === UR) ? 0xF : 0xD;
      typeIndex &= (TileType.Forest === LL) ? 0xF : 0xB;
      typeIndex &= (TileType.Forest === LR) ? 0xF : 0x7;
      if (typeIndex) {
        this.mapLayer1[y][x].tileType = TileType.Forest;
        this.mapLayer1[y][x].index = typeIndex;
      } else {
        // this.mapLayer1[y][x].tileType = TileType.Stump;
        // this.mapLayer1[y][x].index = ((TileType.Forest === UL) ? 0x1 : 0x0) | ((TileType.Forest === UR) ? 0x2 : 0x0) | ((TileType.Forest == LL) ? 0x4 : 0x0) | ((TileType.Forest == LR) ? 0x8 : 0x0);
      }
      this.mapLayer1[y][x].tileType = TileType.Forest;
      this.mapLayer1[y][x].index = typeIndex;
    } else if ((TileType.LightDirt === UL) || (TileType.LightDirt === UR) || (TileType.LightDirt === LL) || (TileType.LightDirt === LR)) {
      typeIndex &= (TileType.LightDirt === UL) ? 0xF : 0xE;
      typeIndex &= (TileType.LightDirt === UR) ? 0xF : 0xD;
      typeIndex &= (TileType.LightDirt === LL) ? 0xF : 0xB;
      typeIndex &= (TileType.LightDirt === LR) ? 0xF : 0x7;
      this.mapLayer1[y][x].tileType = TileType.LightDirt;
      this.mapLayer1[y][x].index = typeIndex;
    } else {
      this.mapLayer1[y][x].tileType = TileType.LightGrass;
      this.mapLayer1[y][x].index = 0xF;
    }
  }

  public updateTiles(tileType: TileType, x: number, y: number, width: number, height: number): void {

  }

  private transitionTiles(tileType: TileType, x: number, y: number, width: number, height: number): void {

    // The top row indicates the current tile type
    // The left column indicates the new tile type being placed
    // Within a cell represents the transition sequence
    // For example placing a ShallowWater tile (w) in a LightGrass field
    // would result in a transition w[wd]g
    // Read wiki for more info on transitions:
    // https://github.com/UCDClassNitta/ECS160Tools/wiki/Tile-Transitions
    /*
    |   | d    | D    | F     | g     | G     | w    | W     | R    |
    |---|------|------|-------|-------|-------|------|-------|------|
    | d | []   | []   | [d]   | [d]   | [d]   | []   | [w]   | []   |
    | D | [D]  | []   | [Dd]  | [Dd]  | [Dd]  | [D]  | [Dw]  | [D]  |
    | F | [F]  | [Fd] | []    | [F]   | [F]   | [Fd] | [Fdw] | [Fd] |
    | g | []   | [d]  | []    | []    | []    | [d]  | [dw]  | [d]  |
    | G | [G]  | [Gd] | [G]   | [G]   | []    | [Gd] | [Gdw] | [Gd] |
    | w | [w]  | [w]  | [wd]  | [wd]  | [wd]  | []   | []    | [w]  |
    | W | [Ww] | [Ww] | [Wwd] | [Wwd] | [Wwd] | [W]  | []    | [Ww] |
    | R | [R]  | [R]  | [Rd]  | [Rd]  | [Rd]  | [R]  | [Rw]  | []   |
    */
    const transitionTable: TileTypeChar[/*newTile*/][/*currentTile*/][/*iteration*/] =
      [
        [[], [], ['d'], ['d'], ['d'], [], ['w'], []],
        [['D'], [], ['D', 'd'], ['D', 'd'], ['D', 'd'], ['D'], ['D', 'w'], ['D']],
        [['F'], ['F', 'd'], [], ['F'], ['F'], ['F', 'd'], ['F', 'd', 'w'], ['F', 'd']],
        [[], ['d'], [], [], [], ['d'], ['d', 'w'], ['d']],
        [['G'], ['G', 'd'], ['G'], ['G'], [], ['G', 'd'], ['G', 'd', 'w'], ['G', 'd']],
        [['w'], ['w'], ['w', 'd'], ['w', 'd'], ['w', 'd'], [], [], ['w']],
        [['W', 'w'], ['W', 'w'], ['W', 'w', 'd'], ['W', 'w', 'd'], ['W', 'w', 'd'], ['W'], [], ['W', 'w']],
        [['R'], ['R'], ['R', 'd'], ['R', 'd'], ['R', 'd'], ['R'], ['R', 'w'], []],
      ];

    for (let iteration = 0; iteration < 3 /*max*/; iteration++) {
      let changed = false;

      const applyTileTransition = (_x: number, _y: number) => {
        const tile = this.mapLayer1[_y][_x];
        const currentType = tile.tileType;
        const tileChar = transitionTable[tileType][currentType][iteration];
        if (tileChar) {
          tile.tileType = charToTileType[tileChar];
          changed = true;
        }
      };

      const transitionEdge = (length: number, fx: (n: number) => number, fy: (n: number) => number) => {
        for (let n = 0; n < length; n++) {
          applyTileTransition(fx(n) + x, fy(n) + y);
        }
      };

      // TODO: bound checking
      transitionEdge(width + 1, (_x) => _x, () => -1); // Top
      transitionEdge(height + 1, () => width, (_y) => _y); // Right
      transitionEdge(width + 1, (_x) => width - _x - 1, () => height); // Bottom
      transitionEdge(height + 1, () => - 1, (_y) => height - _y - 1); // Left

      if (!changed) break;

      x--; y--; width += 2; height += 2;
    }

    // TODO: there is a special case for rocks and forest
    // RdR, FgF
    // When rocks are separated by a single tile, the tile is forced to be lightDirt
    // When forests are separated by a single tile, the tile is forced to be lightGrass
  }

  public stringify(): string {
    // convert the contents of this Map to a string which can be written as configuration
    if (!this.canSave) {
      return undefined;    // return undefined to indicate we could not generate a string, thus not calling the save file IO ipc call
    }

    const lines: string[] = [];

    lines.push(Map.NAME_HEADER);
    lines.push(this.name);
    lines.push(Map.DIMENSION_HEADER);
    lines.push(this.width + ' ' + this.height);

    lines.push(Map.TERRAIN_HEADER);
    for (const yList of this.mapLayer1) {
      let line = '';
      for (const tile of yList) {
        line += numToChar[tile.tileType];  // write out all tile types
      }
      line = line.slice(0, -1);  // remove the right border of rocks
      lines.push(line);
    }
    lines.pop();  // remove the bottom row of rocks

    lines.push(Map.PARTIAL_BITS_HEADER);
    for (const row of this.partialBits) {
      let line = '';
      for (const bit of row) {
        line += (bit.toString(16).toUpperCase());  // write out all bits
      }
      line = line.slice(0, -1);  // remove the right border of partialbits
      lines.push(line);
    }
    lines.pop();  // remove the bottom row of partialbits

    lines.push(Map.PLAYER_NUM_HEADER);
    lines.push(String(this.players.length));    // convert player[] length to string

    lines.push(Map.PLAYER_RESOURCES_HEADER);
    for (const player of this.players) {
      lines.push(player.id + ' ' + player.gold + ' ' + player.lumber);
    }

    lines.push(Map.ASSET_NUM_HEADER);
    lines.push(String(this.assets.length));

    lines.push(Map.ASSET_DETAIL_HEADER);
    for (const asset of this.assets) {
      lines.push(asset.type + ' ' + asset.owner + ' ' + asset.x + ' ' + asset.y);
    }

    return lines.join('\n');  // join all lines with newline
  }

  private parseMapData(mapData: string): void {
    const [, name, dimension, terrain, partialbits, , players, , assets] = mapData.split(/#.*?\r?\n/g);

    this.name = name.trim();
    [this.width, this.height] = dimension.trim().split(' ').map((dim) => parseInt(dim, 10));
    this.mapLayer1 = this.parseTerrain(terrain);
    this.partialBits = this.parsePartialBits(partialbits);
    this.assets = this.parseAssets(assets.trim());
    this.players = this.parsePlayers(players.trim(), this.assets);

    // if execution has reached this point, that means all parsing was completed successfully
    this.canSave = true;
  }

  // PARSE helper methods
  // TODO: implement exception throwing in order to detect parse failure

  private parseTerrain(terrainData: string): Tile[][] {
    const terrain: Tile[][] = [];
    const rows = terrainData.trim().split(/\r?\n/);

    for (const [index, row] of rows.entries()) {
      terrain.push([]);

      for (const tileLetter of row.split('')) {
        terrain[index].push(new Tile(charToTileType[tileLetter]));
      }
    }

    return terrain;
  }

  private parsePartialBits(partialbitsData: string): number[][] {
    // TODO: is string the best way to represent the partial bits? talk to Linux team and figure out what the hell partial bits are
    // I'm guessing that using an actual bit to store this will be more beneficial. note: must be converted to string for stringify()
    const partialbits: number[][] = [];
    const rows = partialbitsData.trim().split(/\r?\n/);

    for (const [index, row] of rows.entries()) {
      partialbits.push([]);

      for (const bit of row.split('')) {
        partialbits[index].push(parseInt(bit, 16));
      }
    }

    return partialbits;
  }

  private parsePlayers(playersData: string, assets: Asset[]): Player[] {
    const players: Player[] = [];
    const lines = playersData.split(/\r?\n/);

    for (const line of lines) {
      const [id, gold, lumber] = line.split(' ').map((x) => parseInt(x, 10));
      players.push(new Player(id, gold, lumber));
    }

    for (const asset of assets) {
      // players[asset.owner].assets.push(asset); won't work if players aren't listed by id-order
      for (const player of players) {
        if (asset.owner === player.id) {
          player.assets.push(asset);
        }
      }
    }

    return players;
  }

  private parseAssets(assetsData: string): Asset[] {
    const parsedAssets: Asset[] = [];
    const lines = assetsData.split(/\r?\n/);

    for (const line of lines) {
      const [type, owner, x, y] = line.split(' ');
      // .map format is type owner x y, whereas asset construction is owner type x y
      parsedAssets.push(new Asset(parseInt(owner, 10), type, parseInt(x, 10), parseInt(y, 10)));
    }

    return parsedAssets;
  }
}
