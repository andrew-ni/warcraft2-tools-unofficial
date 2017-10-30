import { PlayerColor, numToColor } from 'player';

const dimensionMap: Map<string, number> = new Map([
  ['Archer', 1],
  ['Footman', 1],
  ['Peasant', 1],
  ['Ranger', 1],
  ['Barracks', 3],
  ['Blacksmith', 3],
  ['Farm', 2],
  ['CannonTower', 2],
  ['Castle', 3], // ?
  ['GoldMine', 3],
  ['GuardTower', 2],
  ['Keep', 3], // ?
  ['LumberMill', 3],
  ['ScoutTower', 2],
  ['TownHall', 4],
  ['Wall', 1], // probably have to do something special with Wall
  ['Placeholder', 0]
]);

export class Asset {
  owner: number;
  type: string;
  // asset position x,y is relative to the top-left corner of the sprite
  x: number;
  y: number;
  height: number;
  width: number;
  referenceAsset: Asset;

  constructor(owner: number, type: string, x: number, y: number, referenceAsset?: Asset) {
    this.owner = owner;
    this.type = type;
    this.x = x;
    this.y = y;
    this.height = dimensionMap.get(type);
    this.width = dimensionMap.get(type);
  }
}

export enum UnitType {
  Peasant,
  Footman,
}

export class Unit extends Asset {
  constructor(owner: number, type: string, x: number, y: number) {
    super(owner, type, x, y);
  }
}

export enum StructureType {
  Townhall,
  Barracks,
}

export class Structure extends Asset {
  constructor(owner: number, type: string, x: number, y: number) {
    super(owner, type, x, y);
    if (type === 'Placeholder') {
      this.referenceAsset = this.referenceAsset;
    } else {
      this.referenceAsset = this;
    }

  }
}
