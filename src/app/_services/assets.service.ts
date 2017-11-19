import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Rx';

import { Asset, AssetType, Structure, structureTypes, Unit, unitTypes } from 'asset';
import { Coordinate, Region } from 'interfaces';
import { Player } from 'player';
import { MapService } from 'services/map.service';
import { State, UserService } from 'services/user.service';
import { Tile, TileType } from 'tile';

/**
 * Narrow IMap interface to discourage access of unrelated attributes
 */
interface IMap {
  width: number;
  height: number;
  terrainLayer: TileType[][];
  assetLayer: Asset[][];
  drawLayer: Tile[][];
  players: Player[];
  assets: Asset[];
  assetsUpdated: Subject<Region>;
  assetRemoved: Subject<Region>;
  tilesUpdated: Subject<Region>;
  MAX_PLAYERS: number;
}



/**
* AssetsService handles the logic of placing and removing assets (units and buildings),
* including asset and terrain collision and player logic.
*/
@Injectable()
export class AssetsService {
  private map: IMap;
  private userService: UserService;
  private mapService: MapService;

  constructor(
    mapService: MapService,
    userService: UserService,
  ) {
    this.map = mapService;

    this.map.tilesUpdated.do(x => console.log('tilesUpdated:Asset: ', JSON.stringify(x))).subscribe({
      next: reg => {
        this.removeInvalidAsset(reg, false);
      },
      error: err => console.error(err),
      complete: null
    });
  }


  /**
   * Places asset on requested position in assets layer. Also handles legality of placement.
   * @param owner owner of asset to be placed
   * @param type type of asset to be placed
   * @param x x-coord of asset to be placed
   * @param y y-coord of asset to be placed
   * @param validate whether to check for valid place, false means force placement.
   * @fires assetsUpdated With the modified Region.
   */
  public placeAsset(owner: number, type: AssetType, pos: Coordinate, validate = true) {

    if (pos.y < 0 || pos.x < 0 || pos.y > this.map.height - 1 || pos.x > this.map.width - 1) return;
    let asset: Asset;

    if (unitTypes.has(type)) {
      asset = new Unit(owner, type, pos);
    } else if (structureTypes.has(type)) {
      asset = new Structure(owner, type, pos);
    } else return;

    for (let ypos = pos.y; ypos < pos.y + asset.height; ypos++) {
      for (let xpos = pos.x; xpos < pos.x + asset.width; xpos++) {
        if (this.map.assetLayer[ypos][xpos] !== undefined) { console.log('collision'); return; }
        const tileType = this.map.drawLayer[ypos][xpos].tileType;
        if (validate && !(asset.validTiles.has(tileType))) { console.log('terrain collision'); return; }
      }
    }

    for (let ypos = pos.y; ypos < pos.y + asset.height; ypos++) {
      for (let xpos = pos.x; xpos < pos.x + asset.width; xpos++) {
        this.map.assetLayer[ypos][xpos] = asset;
      }
    }
    this.map.assets.push(asset);
    console.log('pushed');

    if (validate) this.map.assetsUpdated.next({ ...pos, width: asset.width, height: asset.height });
  }


  /**
   * Remove any assets placed invalidly within the given region.
   * @param reg The region to check for Assets.
   */
  public removeInvalidAsset(reg: Region, removedByUser: boolean) {
    if (reg.y < 0) reg.y = 0;
    if (reg.x < 0) reg.x = 0;
    if (reg.y + reg.height > this.map.height) reg.height = this.map.height - reg.y;
    if (reg.x + reg.width > this.map.width) reg.width = this.map.width - reg.x;
    for (let y = reg.y; y < reg.y + reg.height; y++) {
      for (let x = reg.x; x < reg.x + reg.width; x++) {
        if (this.map.assetLayer[y][x] !== undefined) {
          const theTerrain = this.map.drawLayer[y][x];
          const theAsset = this.map.assetLayer[y][x];
          if (removedByUser || !(theAsset.validTiles.has(theTerrain.tileType))) {
            this.removeAsset(theAsset);
          }
        }
      }
    }
  }

  /**
   * grabs assets given a region
   * @param reg region to search for assets in
   */
  public selectAssets(reg: Region) {
    const assets: Asset[] = [];
    if (reg.y < 0) reg.y = 0;
    if (reg.x < 0) reg.x = 0;
    if (reg.y + reg.height > this.map.height) reg.height = this.map.height - reg.y;
    if (reg.x + reg.width > this.map.width) reg.width = this.map.width - reg.x;
    for (let y = reg.y; y < reg.y + reg.height; y++) {
      for (let x = reg.x; x < reg.x + reg.width; x++) {
        if (this.map.assetLayer[y][x] !== undefined) {
          const theAsset = this.map.assetLayer[y][x];
          if (assets.indexOf(theAsset) === -1) {
            assets.push(theAsset);
          }
        }
      }
    }
    return assets;
  }



  /**
   * Removes a single asset
   * @param toBeRemoved asset to be removed
   */
  public removeAsset(toBeRemoved: Asset): void {
    this.map.assets.splice(this.map.assets.indexOf(toBeRemoved), 1);
    console.log('removed asset ', toBeRemoved);
    for (let ypos = toBeRemoved.y; ypos < toBeRemoved.y + toBeRemoved.height; ypos++) {
      for (let xpos = toBeRemoved.x; xpos < toBeRemoved.x + toBeRemoved.width; xpos++) {
        this.map.assetLayer[ypos][xpos] = undefined;
      }
    }
    this.map.assetRemoved.next({ x: toBeRemoved.x, y: toBeRemoved.y, width: toBeRemoved.width, height: toBeRemoved.height });

  }

  /**
  * Updates the owner of an array of assets to a new one
  * @param selectedAssets list of assets to be change the owner of
  * @param newOwner the new owner ID of asset to be updated
  */
  public updateOwner(selectedAssets: Asset[], newOwner: number) {
    // invalid owner
    if (newOwner < 0 || newOwner > this.map.MAX_PLAYERS) throw Error('invalid player number');
    for (const asset of selectedAssets) {
      if (asset.type !== AssetType.GoldMine) {
        asset.owner = newOwner;
      }
    }
  }

  /**
   * iterates through selectedassets array and changes the owner if it differs from current owner
   * @param selectedAssets list of assets to have owner changed
   * @param selectedRegions corresponding regions to be passed to assetupdating for recoloring
   * @param newOwner new owner for assets to switch to
   */

  switchPlayer(selectedAssets: Asset[], selectedRegions: Region[], newOwner: number) {
    // update asset owners
    this.updateOwner(selectedAssets, newOwner);

    // update each region in the array to recolor assets
    for (const reg of selectedRegions) {
      this.map.assetsUpdated.next(reg);
    }
    // refocus onto the canvas to allow deletion if desired
    const ac = document.getElementById('assetCanvas');
    ac.focus();

  }
}
