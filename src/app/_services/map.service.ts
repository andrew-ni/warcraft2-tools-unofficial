import { Injectable } from '@angular/core';
import { ReplaySubject, Subject } from 'rxjs/Rx';

import { Asset } from 'asset';
import { Dimension, Region } from 'interfaces';
import { Player } from 'player';
import { Tile, TileType } from 'tile';
import { Tileset } from 'tileset';

@Injectable()
export class MapService {
  /** True if the map is in a valid state to save, False otherwise. */
  public canSave = false;

  /** The name of the map. */
  public name: string;

  /** The description for the map. */
  public description: string;

  /** The width of the map in tiles. */
  public width: number;

  /** The height of the map in tiles. */
  public height: number;

  /** A raw matrix of terrain tile types. This is what is saved and loaded. */
  public terrainLayer: TileType[][];

  /** A list of assets. */
  public assets: Asset[] = [];

  /**
   * A matrix that tracks the location of assets in the map.
   * Assets larger than 1x1 will be assigned to multiple cells.
   * Shares the sames assets as in the list.
   */
  public assetLayer: Asset[][];

  /** A matrix of tiles that is drawn to the canvas. */
  public drawLayer: Tile[][];

  /** Used in the calculation of the tile index */
  public partialBits: Uint8Array[];

  /** A list of players */
  public players: Player[] = [];

  /** The version of map file. */
  public mapVersion: string;

  /** The relative path to the Terrain.dat file. */
  public terrainPath: string;

  /** The tile set used to draw the map. */
  public tileSet: Tileset;


  // Events

  /** @event mapResized When the dimension of the map have changed. */
  public mapResized = new ReplaySubject<Dimension>(1);

  /** @event mapLoaded When the assets and terrain have fully been parsed and initialized. */
  public mapLoaded = new ReplaySubject<void>(1);

  /** @event tilesUpdated When any tile types/indices have changed. */
  public tilesUpdated = new ReplaySubject<Region>(1);

  /** @event assetsUpdated When any assets have changed. */
  public assetsUpdated = new ReplaySubject<Region>(1);

  public assetRemoved = new ReplaySubject<Region>(1);

  constructor() { }
}
