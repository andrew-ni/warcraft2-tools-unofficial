import { TileType, Tile, numToTileType, strToTileType, numToChar, charToTileType, TileTypeChar } from './tile';
import { Player } from './player';
import { Asset } from './asset';
import { Tileset } from './tileset';
import { Subject, Observer, Observable } from 'rxjs/Rx';
import { Dimension, Region } from 'interfaces';
import { ipcRenderer } from 'electron';

export class MapObject {

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
  static DESCRIPTION_HEADER = '# Map Description';
  static TILESET_HEADER = '# Map Tileset';

  // map status flags
  canSave = false; // save state is not ready yet
  // map detail fields
  name: string;
  width: number;
  height: number;
  mapLayer1: Tile[][];
  mapLayer2: Asset[][];
  drawLayer: Tile[][];
  partialBits: Uint8Array[];
  players: Player[] = [];
  assets: Asset[] = [];
  mapVersion: string;
  mapDescription: string;
  terrainPath: string;

  tileSet: Tileset;

  // Events
  private _mapLoaded = new Subject<Dimension>();
  private _tilesUpdated = new Subject<Region>();


  // `mapData` is the raw file contents
  // TODO: move event listener to mapservice, add method to set tileset
  constructor() { }


  public init(mapData: string, filePath = ''): void {
    this.canSave = false;
    this.mapLayer1 = undefined;
    this.drawLayer = undefined;
    this.partialBits = undefined;
    this.players = [];
    this.assets = [];
    this.tileSet = undefined;
    this.parseMapData(mapData);
    ipcRenderer.send('terrain:load', this.terrainPath, filePath);
  }

  public subscribeToMapLoaded(observer: Observer<Dimension>) {
    return this._mapLoaded.subscribe(observer);
  }

  public subscribeToTilesUpdated(observer: Observer<Region>) {
    return this._tilesUpdated.subscribe(observer);
  }

  // by default, calculates indices for whole map
  private calcIndices(reg: Region = { y: 0, x: 0, height: this.height, width: this.width }) {
    for (let ypos = reg.y; ypos < reg.y + reg.height; ypos++) {
      for (let xpos = reg.x; xpos < reg.x + reg.width; xpos++) {
        this.calcIndex(ypos, xpos);
      }
    }

    this._tilesUpdated.next(reg);
  }

  // calcTiles() calculates tile orientation based on surrounding tiles
  // This is the function that writes the proper index into the tiles
  private calcIndex(y = 0, x = 0): void {
    if (y < 0 || x < 0 || y > this.height - 1 || x > this.width - 1) return;

    const UL = this.mapLayer1[y][x].tileType;
    const UR = this.mapLayer1[y][x + 1].tileType;
    const LL = this.mapLayer1[y + 1][x].tileType;
    const LR = this.mapLayer1[y + 1][x + 1].tileType;
    const tile = this.drawLayer[y][x];

    let typeIndex = (((this.partialBits[y][x] & 0x8) >> 3) |
      ((this.partialBits[y][x + 1] & 0x4) >> 1) |
      ((this.partialBits[y + 1][x] & 0x2) << 1) |
      ((this.partialBits[y + 1][x + 1] & 0x1) << 3));

    if ((TileType.DarkGrass === UL) || (TileType.DarkGrass === UR) || (TileType.DarkGrass === LL) || (TileType.DarkGrass === LR)) {
      typeIndex &= (TileType.DarkGrass === UL) ? 0xF : 0xE;
      typeIndex &= (TileType.DarkGrass === UR) ? 0xF : 0xD;
      typeIndex &= (TileType.DarkGrass === LL) ? 0xF : 0xB;
      typeIndex &= (TileType.DarkGrass === LR) ? 0xF : 0x7;
      tile.tileType = TileType.DarkGrass;
      tile.index = this.tileSet.getIndex(tile.tileType, typeIndex, 0); // TODO  alt
    } else if ((TileType.DarkDirt === UL) || (TileType.DarkDirt === UR) || (TileType.DarkDirt === LL) || (TileType.DarkDirt === LR)) {
      typeIndex &= (TileType.DarkDirt === UL) ? 0xF : 0xE;
      typeIndex &= (TileType.DarkDirt === UR) ? 0xF : 0xD;
      typeIndex &= (TileType.DarkDirt === LL) ? 0xF : 0xB;
      typeIndex &= (TileType.DarkDirt === LR) ? 0xF : 0x7;
      tile.tileType = TileType.DarkDirt;
      tile.index = this.tileSet.getIndex(tile.tileType, typeIndex, 0); // TODO  alt
    } else if ((TileType.DeepWater === UL) || (TileType.DeepWater === UR) || (TileType.DeepWater === LL) || (TileType.DeepWater === LR)) {
      typeIndex &= (TileType.DeepWater === UL) ? 0xF : 0xE;
      typeIndex &= (TileType.DeepWater === UR) ? 0xF : 0xD;
      typeIndex &= (TileType.DeepWater === LL) ? 0xF : 0xB;
      typeIndex &= (TileType.DeepWater === LR) ? 0xF : 0x7;
      tile.tileType = TileType.DeepWater;
      tile.index = this.tileSet.getIndex(tile.tileType, typeIndex, 0); // TODO  alt
    } else if ((TileType.ShallowWater === UL) || (TileType.ShallowWater === UR) || (TileType.ShallowWater === LL) || (TileType.ShallowWater === LR)) {
      typeIndex &= (TileType.ShallowWater === UL) ? 0xF : 0xE;
      typeIndex &= (TileType.ShallowWater === UR) ? 0xF : 0xD;
      typeIndex &= (TileType.ShallowWater === LL) ? 0xF : 0xB;
      typeIndex &= (TileType.ShallowWater === LR) ? 0xF : 0x7;
      tile.tileType = TileType.ShallowWater;
      tile.index = this.tileSet.getIndex(tile.tileType, typeIndex, 0); // TODO  alt
    } else if ((TileType.Rock === UL) || (TileType.Rock === UR) || (TileType.Rock === LL) || (TileType.Rock === LR)) {
      typeIndex &= (TileType.Rock === UL) ? 0xF : 0xE;
      typeIndex &= (TileType.Rock === UR) ? 0xF : 0xD;
      typeIndex &= (TileType.Rock === LL) ? 0xF : 0xB;
      typeIndex &= (TileType.Rock === LR) ? 0xF : 0x7;
      tile.tileType = TileType.Rock;
      // tile.tileType = typeIndex ? TileType.Rock : TileType.Rubble;
      tile.index = this.tileSet.getIndex(tile.tileType, typeIndex, 0); // TODO  alt
    } else if ((TileType.Forest === UL) || (TileType.Forest === UR) || (TileType.Forest === LL) || (TileType.Forest === LR)) {
      typeIndex &= (TileType.Forest === UL) ? 0xF : 0xE;
      typeIndex &= (TileType.Forest === UR) ? 0xF : 0xD;
      typeIndex &= (TileType.Forest === LL) ? 0xF : 0xB;
      typeIndex &= (TileType.Forest === LR) ? 0xF : 0x7;
      if (typeIndex) {
        // tile.tileType = TileType.Forest;
        tile.index = this.tileSet.getIndex(tile.tileType, typeIndex, 0); // TODO  alt
      } else {
        // tile.tileType = TileType.Stump;
        // tile.index = ((TileType.Forest === UL) ? 0x1 : 0x0) | ((TileType.Forest === UR) ? 0x2 : 0x0) | ((TileType.Forest == LL) ? 0x4 : 0x0) | ((TileType.Forest == LR) ? 0x8 : 0x0);
      }
      tile.tileType = TileType.Forest;
      tile.index = this.tileSet.getIndex(tile.tileType, typeIndex, 0); // TODO  alt
    } else if ((TileType.LightDirt === UL) || (TileType.LightDirt === UR) || (TileType.LightDirt === LL) || (TileType.LightDirt === LR)) {
      typeIndex &= (TileType.LightDirt === UL) ? 0xF : 0xE;
      typeIndex &= (TileType.LightDirt === UR) ? 0xF : 0xD;
      typeIndex &= (TileType.LightDirt === LL) ? 0xF : 0xB;
      typeIndex &= (TileType.LightDirt === LR) ? 0xF : 0x7;
      tile.tileType = TileType.LightDirt;
      tile.index = this.tileSet.getIndex(tile.tileType, typeIndex, 0); // TODO  alt
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
        this.mapLayer1[ypos][xpos].tileType = tileType;   // set tiletype
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
        if (_y < 0 || _x < 0 || _y > this.height || _x > this.width) {
          return;
        }

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

    // TODO: there is a special case for rocks and forest
    // RdR, FgF
    // When rocks are separated by a single tile, the tile is forced to be lightDirt
    // When forests are separated by a single tile, the tile is forced to be lightGrass
  }


  // SAVE LOGIC

  public stringify(): string {
    // convert the contents of this Map to a string which can be written as configuration
    if (!this.canSave) {
      return undefined;    // return undefined to indicate we could not generate a string, thus not calling the save file IO ipc call
    }

    const lines: string[] = [];

    lines.push(this.mapVersion);
    lines.push(MapObject.NAME_HEADER);
    lines.push(this.name);
    lines.push(MapObject.DIMENSION_HEADER);
    lines.push(this.width + ' ' + this.height);
    lines.push(MapObject.DESCRIPTION_HEADER);
    lines.push(this.mapDescription);
    lines.push(MapObject.TILESET_HEADER);
    lines.push(this.terrainPath);
    lines.push(MapObject.TERRAIN_HEADER);
    for (const yList of this.mapLayer1) {
      let line = '';
      for (const tile of yList) {
        line += numToChar[tile.tileType];  // write out all tile types
      }
      lines.push(line);
    }

    lines.push(MapObject.PARTIAL_BITS_HEADER);
    for (const row of this.partialBits) {
      let line = '';
      for (const bit of row) {
        line += bit.toString(16).toUpperCase();  // write out all bits
      }
      lines.push(line);
    }

    lines.push(MapObject.PLAYER_NUM_HEADER);
    lines.push(String(this.players.length));    // convert player[] length to string

    lines.push(MapObject.PLAYER_RESOURCES_HEADER);
    for (const player of this.players) {
      lines.push(player.id + ' ' + player.gold + ' ' + player.lumber);
    }

    lines.push(MapObject.ASSET_NUM_HEADER);
    lines.push(String(this.assets.length));

    lines.push(MapObject.ASSET_DETAIL_HEADER);
    for (const asset of this.assets) {
      lines.push(asset.type + ' ' + asset.owner + ' ' + asset.x + ' ' + asset.y);
    }

    return lines.join('\n');  // join all lines with newline
  }

  public setTileSet(terrainData: string): void {
    this.tileSet = new Tileset(terrainData);
    this.calcIndices();
  }

  // PARSE FUNCTIONS
  // TODO: implement exception throwing in order to detect parse failure

  private parseMapData(mapData: string): void {
    const [mapVersion, name, dimension, mapDescription, terrainPath, terrain, partialbits, , players, , assets] = mapData.split(/#.*?\r?\n/g);
    this.mapVersion = mapVersion.trim();
    this.name = name.trim();
    [this.width, this.height] = dimension.trim().split(' ').map((dim) => parseInt(dim, 10));
    this.mapDescription = mapDescription.trim();
    this.terrainPath = terrainPath.trim();
    this.mapLayer1 = this.parseTerrain(terrain);
    this.partialBits = this.parsePartialBits(partialbits);
    this.assets = this.parseAssets(assets.trim());
    this.players = this.parsePlayers(players.trim(), this.assets);
    this.initMapLayer2(this.assets);

    // if execution has reached this point, that means all parsing was completed successfully
    this.canSave = true;
    this._mapLoaded.next({ width: this.width, height: this.height });
  }

  private parseTerrain(terrainData: string): Tile[][] {
    const terrain: Tile[][] = [];
    this.drawLayer = [];
    const rows = terrainData.trim().split(/\r?\n/);

    for (const [index, row] of rows.entries()) {
      terrain.push([]);
      this.drawLayer.push([]);

      for (const tileLetter of row.split('')) {
        terrain[index].push(new Tile(charToTileType[tileLetter]));
        this.drawLayer[index].push(new Tile(0));
      }
    }

    return terrain;
  }

  private parsePartialBits(partialbitsData: string) {
    const partialbits: Uint8Array[] = [];
    const rows = partialbitsData.trim().split(/\r?\n/);

    for (const [index, row] of rows.entries()) {
      partialbits.push(Uint8Array.from(Array.from(row).map((hex) => parseInt(hex, 16))));
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

  private initMapLayer2(assets: Asset[]) {
    this.mapLayer2 = [];

    for (var row = 0; row < this.height; row++) {
      var colIndex = 0;
      this.mapLayer2.push([]);
      this.mapLayer2[row] = new Array(this.width);
    }

    for (const asset of assets) {
      this.placeAsset(asset.owner, asset.type, asset.x, asset.y, true);
    }

    console.log(this.mapLayer2);
  }

  private placeAsset(owner: number, type: string, x: number, y: number, init: boolean = false) {
    if (y < 0 || x < 0 || y > this.height - 1 || x > this.width - 1)  return;

    let asset: Asset = new Asset(owner, type, x, y);
    //checks if cells are occupied
    for (var xpos = x; xpos < x + asset.width; xpos++) {
      for (var ypos = y; ypos < y + asset.height; ypos++) {
        if (this.mapLayer2[ypos][xpos] != undefined) { return; }
      }
    }

    if (!init) {
      this.assets.push(asset);
    }

    //placeholder for asset depending on its dimensions
    for (var xpos = x; xpos < x + asset.width; xpos++) {
      for (var ypos = y; ypos < y + asset.height; ypos++) {
        this.mapLayer2[ypos][xpos] = new Asset(asset.owner, "Placeholder", xpos, ypos, asset);
      }
    }

    //positional reference point for asset
    this.mapLayer2[asset.y][asset.x] = asset;
  }

  private removeAsset(x: number, y: number) {
    if (this.mapLayer2[y][x] === undefined) {
      return;
    }

    let assetToBeRemoved = this.mapLayer2[y][x].referenceAsset;

    this.assets.splice(this.assets.indexOf(assetToBeRemoved), 1);

    for (var xpos = assetToBeRemoved.x; xpos < assetToBeRemoved.x + assetToBeRemoved.width; xpos++) {
      for (var ypos = assetToBeRemoved.y; ypos < assetToBeRemoved.y + assetToBeRemoved.height; ypos++) {
        this.mapLayer2[ypos][xpos] = undefined;
      }
    }
  }
}
