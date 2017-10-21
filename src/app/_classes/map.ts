import { TileType, Tile, numToTileType, strToNum, numToChar } from './tile';
import { Player } from './player';
import { Asset } from './asset';

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
    this.calcTiles();
  }

  private calcTiles(x = 0, y = 0, w = this.width, h = this.height): void {

  }

  public updateTiles(tileType: TileType, x: number, y: number, width: number, height: number): void {

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
      lines.push(line);
    }

    lines.push(Map.PARTIAL_BITS_HEADER);
    for (const row of this.partialBits) {
      let line = '';
      for (const bit of row) {
        line += bit;  // write out all bits
      }
      lines.push(line);
    }

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
        terrain[index].push(new Tile(numToTileType[tileLetter]));
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
