import { Asset } from './asset';

export class Player {
  id: number;
  gold: number;
  lumber: number;
  assets: Asset[] = [];

  constructor(id: number, gold: number, lumber: number) {
    this.id = id;
    this.gold = gold;
    this.lumber = lumber;
  }
}
