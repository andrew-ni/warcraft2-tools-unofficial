import { Injectable } from '@angular/core';
import { remote } from 'electron';
import { ReplaySubject, Subject } from 'rxjs/Rx';

import { enableProdMode } from '@angular/core/src/application_ref';
import { Asset } from 'asset';
import { Dimension, Region } from 'interfaces';
import * as JSZip from 'jszip';
import * as path from 'path';
import { Player } from 'player';
import { Tile, TileType } from 'tile';
import { Tileset } from 'tileset';

@Injectable()
export class MapService {

  /** Sprite edge length in pixels */
  public static readonly TERRAIN_SIZE = 32;

  /** maximum num of players of map */
  public static readonly MAX_PLAYERS = 8;

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

  /** AI stuff. */
  public difficulty: string[] = [];
  public events: string[] = [];
  public triggerss: string[][] = [];  // i give up, fml

  /** UI stuff for AI stuff (because I am too lazy to put it in User Service) */
  public uiaiti = -1;  // ui ai triggerIndex
  public uiaisl = -1; // ui ai scrollLeft

  /** The absolute path of index.html during runtime. */
  public readonly resourcePath: string;

  // Events

  /** @event mapResized When the dimension of the map have changed. */
  public mapResized = new ReplaySubject<Dimension>(1);

  /** @event mapLoaded When the assets and terrain have fully been parsed and initialized. */
  public mapLoaded = new ReplaySubject<void>(1);

  /** @event mapProjectOpened When a map project has been open from the file system. */
  public mapProjectOpened = new ReplaySubject<JSZip>(1);

  /** @event mapProjectLoaded When a map project has been open from the file system. */
  public mapProjectLoaded = new ReplaySubject<void>(1);

  /** @event customSndLoaded When the custom sounds from a package have been copied over. */
  public customSndLoaded = new ReplaySubject<void>(1);

  /** @event tilesUpdated When any tile types/indices have changed. */
  public tilesUpdated = new ReplaySubject<Region>(1);

  /** @event assetsUpdated When any assets have changed. */
  public assetsUpdated = new ReplaySubject<Region>(1);

  /** @event assetRemoved When any asset has ben removed. */
  public assetRemoved = new ReplaySubject<Region>(1);

  constructor() {
    this.resourcePath = remote.getGlobal('resourcePath');
  }
}
