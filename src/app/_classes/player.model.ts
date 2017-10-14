import { Asset } from './asset';

export interface IPlayer {
  id: number;
  gold: number;
  lumber: number;
  assets: Asset[];
}
