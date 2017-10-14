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
  mapArray: Tile[][] = [[]];

  // `mapData` is the raw file contents
  constructor(mapData: string) {
    this.imap = this.parseMapData(mapData);
  }

  private parseMapData(mapData: string): IMap {
    for (let i = 0; i < 10/*todo*/; i++) {
      for (let j = 0; j < 10 /*todo*/; j++) {
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
    return null;
  }
}
