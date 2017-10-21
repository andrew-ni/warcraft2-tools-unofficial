export const enum TileType {
  DarkGrass,
  LightGrass,
  DarkDirt,
  LightDirt,
  Rock,
  Forest,
  DeepWater,
  ShallowWater,
  RockPartial,
  ForestPartial,
  MAX,
}

export const strToNum: TileType[] = [];

strToNum['shallow-water'] = TileType.ShallowWater;
strToNum['deep-water'] = TileType.DeepWater;
strToNum['dark-dirt'] = TileType.DarkDirt;
strToNum['dark-grass'] = TileType.DarkGrass;
strToNum['forest'] = TileType.Forest;
strToNum['light-dirt'] = TileType.LightDirt;
strToNum['light-grass'] = TileType.LightGrass;
strToNum['rock'] = TileType.Rock;

export const numToChar: string[] = [];

numToChar[TileType.DarkGrass] = 'G';
numToChar[TileType.LightGrass] = 'g';
numToChar[TileType.DarkDirt] = 'D';
numToChar[TileType.LightDirt] = 'd';
numToChar[TileType.Rock] = 'R';
numToChar[TileType.Forest] = 'F';
numToChar[TileType.DeepWater] = 'W';
numToChar[TileType.ShallowWater] = 'w';

export const numToTileType: TileType[] = [];
// TileType.xxx within the square brackets will implicitly be cast to number
// but the TileType.xxx being assigned will not be casted.
// This allows for mapping from number to TileType
numToTileType[numToChar[TileType.DarkGrass]] = TileType.DarkGrass;
numToTileType[numToChar[TileType.LightGrass]] = TileType.LightGrass;
numToTileType[numToChar[TileType.DarkDirt]] = TileType.DarkDirt;
numToTileType[numToChar[TileType.LightDirt]] = TileType.LightDirt;
numToTileType[numToChar[TileType.Rock]] = TileType.Rock;
numToTileType[numToChar[TileType.RockPartial]] = TileType.RockPartial;
numToTileType[numToChar[TileType.Forest]] = TileType.Forest;
numToTileType[numToChar[TileType.ForestPartial]] = TileType.ForestPartial;
numToTileType[numToChar[TileType.ShallowWater]] = TileType.ShallowWater;
numToTileType[numToChar[TileType.DeepWater]] = TileType.DeepWater;

export class Tile {
  constructor(tileType: TileType) {
    this.tileType = tileType;
  }
  tileType: TileType;
  index: number;
}
