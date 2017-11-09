import { Coordinate } from 'interfaces';
import { TileType } from 'tile';

export enum AssetType {
  Archer,
  Footman,
  Peasant,
  Ranger,
  Barracks,
  Blacksmith,
  Farm,
  CannonTower,
  Castle,
  GoldMine,
  GuardTower,
  Keep,
  LumberMill,
  ScoutTower,
  TownHall,
  Wall,
  Placeholder,
  Terrain,
  Colors,
}

const dimensionMap: Map<AssetType, number> = new Map([
  [AssetType.Archer, 1],
  [AssetType.Footman, 1],
  [AssetType.Peasant, 1],
  [AssetType.Ranger, 1],
  [AssetType.Barracks, 3],
  [AssetType.Blacksmith, 3],
  [AssetType.Farm, 2],
  [AssetType.CannonTower, 2],
  [AssetType.Castle, 3], // ?
  [AssetType.GoldMine, 3],
  [AssetType.GuardTower, 2],
  [AssetType.Keep, 3], // ?
  [AssetType.LumberMill, 3],
  [AssetType.ScoutTower, 2],
  [AssetType.TownHall, 4],
  [AssetType.Wall, 1], // probably have to do something special with Wall
  [AssetType.Placeholder, 0]
]);

/** The set of all unit assets. */
export const unitTypes = new Set<AssetType>([
  AssetType.Peasant,
  AssetType.Footman,
  AssetType.Ranger,
  AssetType.Archer,
]);

/** The set of all structure assets. */
export const structureTypes = new Set<AssetType>([
  AssetType.Barracks,
  AssetType.Blacksmith,
  AssetType.CannonTower,
  AssetType.Castle,
  AssetType.Farm,
  AssetType.GoldMine,
  AssetType.GuardTower,
  AssetType.Keep,
  AssetType.LumberMill,
  AssetType.ScoutTower,
  AssetType.TownHall,
  AssetType.Wall
]);

/** The set of neutral assets. */
export const neutralAssets = new Set<AssetType>([
  AssetType.GoldMine,
  AssetType.Wall,
  AssetType.Terrain,
  AssetType.Colors,
]);

export class Asset {
  owner: number;
  type: AssetType;
  // asset position x,y is relative to the top-left corner of the sprite
  x: number;
  y: number;
  height: number;
  width: number;
  referenceAsset: Asset;
  validTiles: Set<TileType>;

  constructor(owner: number, type: AssetType, pos: Coordinate, referenceAsset?: Asset) {
    this.owner = owner;
    this.type = type;
    this.x = pos.x;
    this.y = pos.y;
    this.height = dimensionMap.get(type);
    this.width = dimensionMap.get(type);
  }
}

export class Unit extends Asset {
  constructor(owner: number, type: AssetType, pos: Coordinate) {
    super(owner, type, pos);
    this.validTiles = new Set<TileType>([TileType.DarkDirt, TileType.DarkGrass, TileType.LightDirt, TileType.LightGrass]);
  }
}

export class Structure extends Asset {
  constructor(owner: number, type: AssetType, pos: Coordinate) {
    super(owner, type, pos);
    this.validTiles = new Set<TileType>([TileType.DarkGrass, TileType.LightGrass]);
    if (neutralAssets.has(type)) { this.owner = 0; }
  }
}
