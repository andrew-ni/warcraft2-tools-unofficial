// DON'T REORDER!
/**
 * TileType enum stores all the valid basic terrain tiles.
 */
export const enum TileType {
  LightDirt,
  DarkDirt,
  Forest,
  LightGrass,
  DarkGrass,
  ShallowWater,
  DeepWater,
  Rock,
  MAX,
}

/**
 * strToTileType maps strings to tile types for use in parsing terrain.dat
 */
export const strToTileType: TileType[] = [];

strToTileType['shallow-water'] = TileType.ShallowWater;
strToTileType['deep-water'] = TileType.DeepWater;
strToTileType['dark-dirt'] = TileType.DarkDirt;
strToTileType['dark-grass'] = TileType.DarkGrass;
strToTileType['forest'] = TileType.Forest;
strToTileType['light-dirt'] = TileType.LightDirt;
strToTileType['light-grass'] = TileType.LightGrass;
strToTileType['rock'] = TileType.Rock;

/**
 * TileTypeChar is the type that contains all possible tile types in character
 * form. This is mainly used in the map save file.
 */
export type TileTypeChar = 'd' | 'D' | 'F' | 'g' | 'G' | 'w' | 'W' | 'R';

/**
 * numToChar maps TileType to characters. Used for saving maps.
 */
export const numToChar: TileTypeChar[] = [];
numToChar[TileType.DarkGrass] = 'G';
numToChar[TileType.LightGrass] = 'g';
numToChar[TileType.DarkDirt] = 'D';
numToChar[TileType.LightDirt] = 'd';
numToChar[TileType.Rock] = 'R';
numToChar[TileType.Forest] = 'F';
numToChar[TileType.DeepWater] = 'W';
numToChar[TileType.ShallowWater] = 'w';

/**
 * numToTileType maps nums to TileType.
 */
export const numToTileType: TileType[] = [];
// TileType.xxx within the square brackets will implicitly be cast to number
// but the TileType.xxx being assigned will not be casted.
// This allows for mapping from number to TileType
numToTileType[TileType.DarkGrass] = TileType.DarkGrass;
numToTileType[TileType.LightGrass] = TileType.LightGrass;
numToTileType[TileType.DarkDirt] = TileType.DarkDirt;
numToTileType[TileType.LightDirt] = TileType.LightDirt;
numToTileType[TileType.Rock] = TileType.Rock;
numToTileType[TileType.Forest] = TileType.Forest;
numToTileType[TileType.ShallowWater] = TileType.ShallowWater;
numToTileType[TileType.DeepWater] = TileType.DeepWater;


export const charToTileType: TileType[] = [];

charToTileType[numToChar[TileType.DarkGrass]] = TileType.DarkGrass;
charToTileType[numToChar[TileType.LightGrass]] = TileType.LightGrass;
charToTileType[numToChar[TileType.DarkDirt]] = TileType.DarkDirt;
charToTileType[numToChar[TileType.LightDirt]] = TileType.LightDirt;
charToTileType[numToChar[TileType.Rock]] = TileType.Rock;
charToTileType[numToChar[TileType.Forest]] = TileType.Forest;
charToTileType[numToChar[TileType.ShallowWater]] = TileType.ShallowWater;
charToTileType[numToChar[TileType.DeepWater]] = TileType.DeepWater;

export class Tile {
  constructor(tileType: TileType) {
    this.tileType = tileType;
  }
  tileType: TileType;
  index: number;
}
