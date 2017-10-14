import { Tile } from './tile';
import { Player } from './player';

export interface IMap {
  name: string;
  x: number;
  y: number;
  numPlayers: number;
  numAssets: number;
  mapLayer1: Tile[][];
  players: Player[];
}
