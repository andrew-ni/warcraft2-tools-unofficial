import { Tile } from './tile';
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
    const [, name, dimension, terrain, bits, , players, , assets] = mapData.split(/#.*?\r?\n/g);

    this.name = name.trim();
    [this.width, this.height] = dimension.trim().split(' ').map((dim) => parseInt(dim, 10));
    this.mapLayer1 = this.parseTerrain(terrain);
    this.assets = this.parseAssets(assets);
    this.players = this.parsePlayers(players, this.assets);
  }

  private parseTerrain(terrainData: string): Tile[][] {
    const mapArray = new Array(this.height);
    for (let i = 0; i < this.height; i++) {
      mapArray[i] = new Array(this.width);
    }
    terrainData = terrainData.replace(/[^a-zA-Z]/g, '');
    for (let i = 0; i < this.height; i++) {
      for (let j = 0; j < this.width; j++) {
        switch (terrainData[i * this.height + j]) {
          case 'G':
            mapArray[i][j] = new Tile('DarkGrass');
            break;
          case 'g':
            mapArray[i][j] = new Tile('LightGrass');
            break;
          case 'D':
            mapArray[i][j] = new Tile('DarkDirt');
            break;
          case 'd':
            mapArray[i][j] = new Tile('LightDirt');
            break;
          case 'R':
            mapArray[i][j] = new Tile('Rock');
            break;
          case 'r':
            mapArray[i][j] = new Tile('RockPartial');
            break;
          case 'F':
            mapArray[i][j] = new Tile('Forest');
            break;
          case 'f':
            mapArray[i][j] = new Tile('ForestPartial');
            break;
          case 'W':
            mapArray[i][j] = new Tile('DeepWater');
            break;
          case 'w':
            mapArray[i][j] = new Tile('ShallowWater');
            break;
          default:
            mapArray[i][j] = new Tile('PARSEFAIL');
            break;
        }
      }
    }
    return mapArray;
  }

  private parsePlayers(playersData: string, assets: Asset[]): Player[] {
    const players: Player[] = [];
    const lines = playersData.split('\n');

    let line: string;
    let lineArray = [];
    let asset: Asset;
    let player: Player;

    for (line of lines) {
      lineArray = line.split(' ');
      players.push(new Player(lineArray[0], lineArray[1], lineArray[2]));
    }

    for (asset of assets) {
      // players[asset.owner].assets.push(asset); won't work if players aren't listed by id-order
      for (player of players) {
        if (asset.owner === player.id) {
          player.assets.push(asset);
        }
      }
    }

    return players;
  }

  private parseAssets(assetsData: string): Asset[] {
    return null;
  }
}
