import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Rx';
import { TileType, Tile } from '../_classes/tile';

import { Dimension, Region } from 'interfaces';
import { UserService } from 'services/user.service';
import { Player } from 'player';
import { Asset } from 'asset';
import { Tileset } from 'tileset';

@Injectable()
export class MapService {
  public canSave = false; // save state is not ready yet
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


  // Events
  public mapResized = new Subject<Dimension>();
  public mapLoaded = new Subject<void>();
  public tilesUpdated = new Subject<Region>();

  constructor(private userService: UserService) {
  }
}
