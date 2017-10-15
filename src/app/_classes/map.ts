import { Tile, strToTileType } from './tile';
import { Player } from './player';
import { Asset } from './asset';

export class Map {
  name: string;
  width: number;
  height: number;
  mapLayer1: Tile[][];
  players: Player[] = [];
  assets: Asset[] = [];

  // `mapData` is the raw file contents
  constructor(mapData: string) {
    this.parseMapData(mapData);
  }

  private parseMapData(mapData: string): void {
    const [, name, dimension, terrain, , , players, , assets] = mapData.split(/#.*?\r?\n/g);

    this.name = name.trim();
    [this.width, this.height] = dimension.trim().split(' ').map((dim) => parseInt(dim, 10));
    this.mapLayer1 = this.parseTerrain(terrain);
    this.assets = this.parseAssets(assets.trim());
    this.players = this.parsePlayers(players.trim(), this.assets);
  }

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
