//hard-coding dimensions for peasant and goldmine for now
var dimensionMap: Map<string, number> = new Map([["Peasant", 2], ["GoldMine", 3], ["Placeholder", 0]]);

export class Asset {
  owner: number;
  type: string;
  //asset position x,y is relative to the top-left corner of the sprite
  x: number;
  y: number;
  height: number;
  width: number;
  canBeSelected: boolean;

  constructor(owner: number, type: string, x: number, y: number) {
    this.owner = owner;
    this.type = type;
    this.x = x;
    this.y = y;
    this.height = dimensionMap.get(type);
    this.width = dimensionMap.get(type);

    //only reference point x,y of asset is selectable
    if (type === "Placeholder") {
      this.canBeSelected = false;
    } else {
      this.canBeSelected = true;
    }
  }
}

export class Unit extends Asset {
  constructor(owner: number, type: string, x: number, y: number) {
    super(owner, type, x, y);
  }
}

export class Structure extends Asset {
  constructor(owner: number, type: string, x: number, y: number) {
    super(owner, type, x, y);
  }
}
