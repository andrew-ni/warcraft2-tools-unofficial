import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Rx';

import { Asset } from 'asset';
import { Dimension, Region } from 'interfaces';
import { Player } from 'player';
import { Tile, TileType } from 'tile';
import { Tileset } from 'tileset';

@Injectable()
export class MapService {
  public canSave = false;
  public name: string;
  public description: string;
  public width: number;
  public height: number;
  public terrainLayer: TileType[][];
  public assetLayer: Asset[][];
  public drawLayer: Tile[][];
  public partialBits: Uint8Array[];
  public players: Player[] = [];
  public assets: Asset[] = [];
  public mapVersion: string;
  public terrainPath: string;
  public tileSet: Tileset;


  /**
   * Events
   */
  public mapResized = new Subject<Dimension>();
  public mapLoaded = new Subject<void>();
  public tilesUpdated = new Subject<Region>();

  constructor() { }
}
