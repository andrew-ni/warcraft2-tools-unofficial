import { Injectable } from '@angular/core';
import { Subject, Observer, Subscription, Observable } from 'rxjs/Rx';
import { TileType } from '../_classes/tile';

import { MapObject } from 'map';
import { Dimension, Region, Coordinate } from 'interfaces';
import { UserService } from 'services/user.service';
import { PlayerColor, numToColor } from 'player';
import { AssetType, strToAssetType } from 'asset';

@Injectable()
export class MapService {
  public map: MapObject;


  // Events
  public mapLoaded = new Subject<Dimension>();
  public tilesUpdated = new Subject<Region>();

  constructor(private userService: UserService) {
    this.map = new MapObject();
  }

  // public subscribeToMapLoaded(observer: Observer<Dimension>) {
  //   return this._mapLoaded.subscribe(observer);
  // }

  // public subscribeToTilesUpdated(observer: Observer<Region>) {
  //   return this._tilesUpdated.subscribe(observer);
  // }



}
