import { Tile, strToTileType } from './tile';
import { Player } from './player';
import { Asset } from './asset';

export class Map {

  // Headers are for stringify(), which needs them to output map comments
  NAME_HEADER = '# Map Name';
  DIMENSION_HEADER = '# Map Dimensions W x H';
  TERRAIN_HEADER = '# Map Terrain Data';
  PARTIAL_BITS_HEADER = '# Map Partial Bits';
  PLAYER_NUM_HEADER = '# Number of players';
  PLAYER_RESOURCES_HEADER = '# Starting resources Player Gold Lumber';
  ASSET_NUM_HEADER = '# Number of assets';
  ASSET_DETAIL_HEADER = '# Starting assets Type Owner X Y';
  AI_NUM_HEADER = '# Number of scripts';
  AI_SCRIPTS_HEADER = '# AI Scripts';

  name: string;
  width: number;
  height: number;
  mapLayer1: Tile[][];
  partialBits: string[][];
  players: Player[] = [];
  assets: Asset[] = [];

  // `mapData` is the raw file contents
  constructor(mapData: string) {
    this.parseMapData(mapData);
  }

  public stringify(): string {
    // convert the contents of this file to a string which can be written as configuration
    return 'dummy output';
  }

  private parseMapData(mapData: string): void {
    const [, name, dimension, terrain, partialbits, , players, , assets] = mapData.split(/#.*?\r?\n/g);

    this.name = name.trim();
    [this.width, this.height] = dimension.trim().split(' ').map((dim) => parseInt(dim, 10));
    this.mapLayer1 = this.parseTerrain(terrain);
    this.partialBits = this.parsePartialBits(partialbits);
    this.assets = this.parseAssets(assets.trim());
    this.players = this.parsePlayers(players.trim(), this.assets);
  }

  // PARSE helper methods

  private parseTerrain(terrainData: string): Tile[][] {
    const terrain: Tile[][] = [];
    const rows = terrainData.trim().split(/\r?\n/);

    for (const [index, row] of rows.entries()) {
      terrain.push([]);

      for (const tileLetter of row.split('')) {
        terrain[index].push(new Tile(strToTileType[tileLetter]));
      }
    }

    return terrain;
  }

  private parsePartialBits(partialbitsData: string): string[][] {
    // TODO: is string the best way to represent the partial bits? talk to Linux team and figure out what the hell partial bits are
    // I'm guessing that using an actual bit to store this will be more beneficial. note: must be converted to string for stringify()
    const partialbits: string[][] = [];
    const rows = partialbitsData.trim().split(/\r?\n/);

    for (const [index, row] of rows.entries()) {
      partialbits.push([]);

      for (const bit of row.split('')) {
        partialbits[index].push(bit);
      }
    }

    return partialbits;
  }

  private parsePlayers(playersData: string, assets: Asset[]): Player[] {
    const players: Player[] = [];
    const lines = playersData.split('\r\n');

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
    const lines = assetsData.split('\r\n');

    for (const line of lines) {
      const [type, owner, x, y] = line.split(' ');
      // .map format is type owner x y, whereas asset construction is owner type x y
      parsedAssets.push(new Asset(parseInt(owner, 10), type, parseInt(x, 10), parseInt(y, 10)));
    }

    return parsedAssets;
  }
}
