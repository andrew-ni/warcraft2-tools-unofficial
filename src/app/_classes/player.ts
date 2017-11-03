import { Asset } from 'asset';

// Taken from game files
export const enum PlayerColor {
  None,
  Red,
  Blue,
  Green,
  Purple,
  Orange,
  Yellow,
  Black,
  White,
  Max
}

export const numToColor: PlayerColor[] = [];
// numToColor[PlayerColor.None] = PlayerColor.None;
numToColor[PlayerColor.Red] = PlayerColor.Red;
numToColor[PlayerColor.Blue] = PlayerColor.Blue;
numToColor[PlayerColor.Green] = PlayerColor.Green;
numToColor[PlayerColor.Purple] = PlayerColor.Purple;
numToColor[PlayerColor.Orange] = PlayerColor.Orange;
numToColor[PlayerColor.Yellow] = PlayerColor.Yellow;
numToColor[PlayerColor.Black] = PlayerColor.Black;
numToColor[PlayerColor.White] = PlayerColor.White;


export class Player {
  id: number;
  gold: number;
  lumber: number;
  assets: Asset[] = [];
  color: PlayerColor;

  constructor(id: number, gold: number, lumber: number) {
    this.id = id;
    this.gold = gold;
    this.lumber = lumber;
    this.color = numToColor[this.id];
  }
}
