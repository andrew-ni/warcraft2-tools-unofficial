
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
}

// export enum UnitType {
//   Archer,
//   Footman,
//   Peasant,
//   Ranger,
// }

// export enum StructureType {
//   Barracks,
//   Blacksmith,
//   Farm,
//   CannonTower,
//   Castle,
//   GoldMine,
//   GuardTower,
//   Keep,
//   LumberMill,
//   ScoutTower,
//   TownHall,
//   Wall,
//   Placeholder,
// }

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

export const strToAssetType: (AssetType)[] = [];
strToAssetType['Archer'] = AssetType.Archer;
strToAssetType['Footman'] = AssetType.Footman;
strToAssetType['Peasant'] = AssetType.Peasant;
strToAssetType['Ranger'] = AssetType.Ranger;
strToAssetType['Barracks'] = AssetType.Barracks;
strToAssetType['Blacksmith'] = AssetType.Blacksmith;
strToAssetType['Farm'] = AssetType.Farm;
strToAssetType['CannonTower'] = AssetType.CannonTower;
strToAssetType['Castle'] = AssetType.Castle;
strToAssetType['GoldMine'] = AssetType.GoldMine;
strToAssetType['GuardTower'] = AssetType.GuardTower;
strToAssetType['Keep'] = AssetType.Keep;
strToAssetType['LumberMill'] = AssetType.LumberMill;
strToAssetType['ScoutTower'] = AssetType.ScoutTower;
strToAssetType['TownHall'] = AssetType.TownHall;
strToAssetType['Wall'] = AssetType.Wall;
strToAssetType['Placeholder'] = AssetType.Placeholder;
strToAssetType['Terrain'] = AssetType.Terrain;

export type AssetTypeString = 'Archer' | 'Barracks' | 'Blacksmith' | 'CannonTower' | 'Castle' | 'Farm' | 'Footman' | 'GoldMine'|'GuardTower'|'Keep'|'LumberMill'|'Peasant'|'Ranger'|'ScoutTower'|'TownHall'|'Placeholder'|'Wall'|'Terrain';

export const numToString: AssetTypeString[] = [];
numToString[AssetType.Archer] = 'Archer';
numToString[AssetType.Footman] = 'Footman';
numToString[AssetType.Peasant] = 'Peasant';
numToString[AssetType.Ranger] = 'Ranger';
numToString[AssetType.Barracks] = 'Barracks';
numToString[AssetType.Blacksmith] = 'Blacksmith';
numToString[AssetType.CannonTower] = 'CannonTower';
numToString[AssetType.Castle] = 'Castle';
numToString[AssetType.Farm] = 'Farm';
numToString[AssetType.GoldMine] = 'GoldMine';
numToString[AssetType.GuardTower] = 'GuardTower';
numToString[AssetType.Keep] = 'Keep';
numToString[AssetType.LumberMill] = 'LumberMill';
numToString[AssetType.ScoutTower] = 'ScoutTower';
numToString[AssetType.TownHall] = 'TownHall';
numToString[AssetType.Wall] = 'Wall';
numToString[AssetType.Placeholder] = 'Placeholder';
numToString[AssetType.Terrain] = 'Terrain';

export class Asset {
  owner: number;
  type: string;
  assetType: AssetType;
  // asset position x,y is relative to the top-left corner of the sprite
  x: number;
  y: number;
  height: number;
  width: number;
  referenceAsset: Asset;

  constructor(owner: number, type: AssetType, x: number, y: number, referenceAsset?: Asset) {
    this.owner = owner;
    this.assetType = type;
    this.x = x;
    this.y = y;
    this.height = dimensionMap.get(type);
    this.width = dimensionMap.get(type);
    this.type = numToString[type];
  }
}

export class Unit extends Asset {
  assetType: AssetType;
  constructor(owner: number, type: AssetType, x: number, y: number) {
    super(owner, type, x, y);
  }
}

export class Structure extends Asset {
  assetType: AssetType;
  constructor(owner: number, type: AssetType, x: number, y: number) {
    super(owner, type, x, y);
    if (type === AssetType.Placeholder) {
      this.referenceAsset = this.referenceAsset;
    } else {
      this.referenceAsset = this;
    }
  }
}
