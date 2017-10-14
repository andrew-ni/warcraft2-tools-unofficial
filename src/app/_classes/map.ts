import { Tile } from './tile';
import { Player } from './player';

export class Map {
  name: string;
  x: number;
  y: number;
  numPlayers: number;
  numAssets: number;
  mapLayer1: Tile[][];
  players: Player[] = [];

  // `mapData` is the raw file contents
  constructor(mapData: string) {
    this.parseMapData(mapData);
  }

  private parseMapData(mapData: string): void {
    this.name = this.parseName(mapData);

    [this.x, this.y] = this.parseDimensions(mapData);

    this.numPlayers = this.parseNumPlayers(mapData);
    this.numAssets = this.parseNumAssets(mapData);

    this.mapLayer1 = this.parseTerrain(mapData);
    this.players = this.parsePlayers(this.numPlayers, mapData);
  }

  private parseName(mapData: string): string {
    return '';
  }

  private parseDimensions(mapData: string): number[] {
    return null;
  }

  private parseNumPlayers(mapData: string): number {
    return 10;
  }

  private parseNumAssets(mapData: string): number {
    return 10;
  }

  private parseTerrain(mapData: string): Tile[][] {
    return null;
  }

  private parsePlayers(numPlayers: number, mapData: string): Player[] {
    return null;
  }


  // private parseMapData(mapData: string): IMap {
  //   for (let i = 0; i < 10/*todo*/; i++) {
  //     for (let j = 0; j < 10 /*todo*/; j++) {
  //       switch (mapData[i]) {
  //         case 'G':
  //           this.mapArray[i][j] = new Tile('DarkGrass', '');
  //           break;
  //         case 'g':
  //           this.mapArray[i][j] = new Tile('LightGrass', '');
  //           break;
  //         case 'D':
  //           this.mapArray[i][j] = new Tile('DarkDirt', '');
  //           break;
  //         case 'd':
  //           this.mapArray[i][j] = new Tile('LightDirt', '');
  //           break;
  //         case 'R':
  //           this.mapArray[i][j] = new Tile('Rock', '');
  //           break;
  //         case 'r':
  //           this.mapArray[i][j] = new Tile('RockPartial', '');
  //           break;
  //         case 'F':
  //           this.mapArray[i][j] = new Tile('Forest', '');
  //           break;
  //         case 'f':
  //           this.mapArray[i][j] = new Tile('ForestPartial', '');
  //           break;
  //         case 'W':
  //           this.mapArray[i][j] = new Tile('DeepWater', '');
  //           break;
  //         case 'w':
  //           this.mapArray[i][j] = new Tile('ShallowWater', '');
  //           break;
  //         default:
  //           this.mapArray[i][j] = new Tile('PARSEFAIL', '');
  //           break;
  //       }
  //     }
  //   }
  //   return null;
  // }



}
