export class Asset {
  owner: number;
  type: string;
  x: number;
  y: number;

  constructor(owner: number, type: string, x: number, y: number) {
    this.owner = owner;
    this.type = type;
    this.x = x;
    this.y = y;
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
