export class Map {
  
    // `mapData` is the raw file contents
    constructor(mapData: string) {
      this.parseMapData(mapData);
    }
  
    private parseMapData(mapData: string): void {
      const Map: Tile[] = new Array();
      for (let i = 0, len = mapData.length; i < len; i++) {
        console.log(i);
        switch (mapData[i]) {
          case 'G':
            Map.push(new Tile('DarkGrass', ''));
            break;
          case 'g':
            Map.push(new Tile('LightGrass', ''));
            break;
          case 'D':
            Map.push(new Tile('DarkDirt', ''));
            break;
          case 'd':
            Map.push(new Tile('LightDirt', ''));
            break;
          case 'R':
            Map.push(new Tile('Rock', ''));
            break;
          case 'r':
            Map.push(new Tile('RockPartial', ''));
            break;
          case 'F':
            Map.push(new Tile('Forest', ''));
            break;
          case 'f':
            Map.push(new Tile('ForestPartial', ''));
            break;
          case 'W':
            Map.push(new Tile('DeepWater', ''));
            break;
          case 'w':
            Map.push(new Tile('ShallowWater', ''));
            break;
          default:
            Map.push(new Tile('PARSEFAIL', ''));
            break;
        }
      }
    }
  }
  