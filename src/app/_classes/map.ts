import { Tile } from './tile';
import { IMap } from './map.model';

export class Map {
  imap: IMap;
  nameStr: string;
  dimStr: string;
  terrainStr: string;
  partialStr: string;
  numPlayersStr: string;
  startResStr: string;
  numAssetsStr: string;
  startAssetsStr: string;
<<<<<<< HEAD
  mapArray: Tile[][] = [[]];

  // `mapData` is the raw file contents
  constructor(mapData: string) {
    this.imap = this.parseMapData(mapData);
  }

  private parseMapData(mapData: string): IMap {
    for (let i = 0; i < 10/*todo*/; i++) {
      for (let j = 0; j < 10 /*todo*/; j++) {
=======

  // `mapData` is the raw file contents
  constructor(mapData: string) {
    this.height = 5;
    this.width = 5;
    this.mapArray = new Array(5);
    for (let i = 0; i < this.height; i++) {
      this.mapArray[i] = new Array(5);
      for (let j = 0; j < this.width; j++) {
        this.mapArray[i][j] = new Tile('', '');
      }
    }
    this.parseMapData(mapData);
  }
  height: number;
  width: number;
  mapArray: Tile[][];


  private parseMapData(mapData: string): void {
    for (let i = 0; i < this.height; i++) {
      for (let j = 0; j < this.width; j++) {
>>>>>>> cleaned up map.ts
        switch (mapData[i]) {
          case 'G':
            this.mapArray[i][j] = new Tile('DarkGrass', '');
            break;
          case 'g':
            this.mapArray[i][j] = new Tile('LightGrass', '');
            break;
          case 'D':
            this.mapArray[i][j] = new Tile('DarkDirt', '');
            break;
          case 'd':
            this.mapArray[i][j] = new Tile('LightDirt', '');
            break;
          case 'R':
            this.mapArray[i][j] = new Tile('Rock', '');
            break;
          case 'r':
            this.mapArray[i][j] = new Tile('RockPartial', '');
            break;
          case 'F':
            this.mapArray[i][j] = new Tile('Forest', '');
            break;
          case 'f':
            this.mapArray[i][j] = new Tile('ForestPartial', '');
            break;
          case 'W':
            this.mapArray[i][j] = new Tile('DeepWater', '');
            break;
          case 'w':
            this.mapArray[i][j] = new Tile('ShallowWater', '');
            break;
          default:
            this.mapArray[i][j] = new Tile('PARSEFAIL', '');
            break;
        }
      }
    }
<<<<<<< HEAD
    return null;
=======
>>>>>>> cleaned up map.ts
  }
}
