export const enum TileType {
  DarkGrass = 'G',
  LightGrass = 'g',
  DarkDirt = 'D',
  LightDirt = 'd',
  Rock = 'R',
  RockPartial = 'r',
  Forest = 'F',
  ForestPartial = 'f',
  DeepWater = 'W',
  ShallowWater = 'w',
}

export const strToTileType: TileType[] = [];
// TileType.xxx within the square brackets will implicitly be cast to string
// but the TileType.xxx being assigned will not be casted.
// This allows for mapping from string to TileType
strToTileType[TileType.DarkGrass] = TileType.DarkGrass;
strToTileType[TileType.LightGrass] = TileType.LightGrass;
strToTileType[TileType.DarkDirt] = TileType.DarkDirt;
strToTileType[TileType.LightDirt] = TileType.LightDirt;
strToTileType[TileType.Rock] = TileType.Rock;
strToTileType[TileType.RockPartial] = TileType.RockPartial;
strToTileType[TileType.Forest] = TileType.Forest;
strToTileType[TileType.ForestPartial] = TileType.ForestPartial;
strToTileType[TileType.ShallowWater] = TileType.ShallowWater;
strToTileType[TileType.DeepWater] = TileType.DeepWater;

export class Tile {
  constructor(tileType: TileType) {
    this.tileType = tileType;
  }
  tileType: TileType;
  index: number;

  public updateTiles( newTile: TileType, x: number, y: number, width = 1, height = 1) {
    asdf;

    return {x, y, width, height};
  }
}
