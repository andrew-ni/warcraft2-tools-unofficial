import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Rx';

import { Asset, AssetType } from 'asset';
import { Coordinate, Region } from 'interfaces';
import { Player } from 'player';
import { MapService } from 'services/map.service';
import { TileType } from 'tile';

/**
 * Narrow IMap interface to discourage access of unrelated attributes
 */
interface IMap {
  width: number;
  height: number;
  terrainLayer: TileType[][];
  assetLayer: Asset[][];
  players: Player[];
  assets: Asset[];
  assetsUpdated: Subject<Region>;
}

/**
* AssetsService handles the logic of placing and removing assets (units and buildings),
* including asset and terrain collision and player logic.
*/
@Injectable()
export class AssetsService {
  private map: IMap;

  constructor(
    mapService: MapService,
  ) {
    this.map = mapService;
  }

 // TODO: refactor to take Coordinate, change to use x y from Region, expand Region before firing event (like in terrain?)
 /**
  * Updates assetLayer and performs collision checking.
  * @param owner owner of asset to be placed
  * @param type type of asset to be placed
  * @param x x-coord of asset to be placed
  * @param y y-coord of asset to be placed
  * @param reg
  * @fires assetsUpdated With the modified Region.
  */
  public placeAsset(owner: number, type: AssetType, coord: Coordinate) {
    const y = coord.y;
    const x = coord.x;
    if (y < 0 || x < 0 || y > this.map.height - 1 || x > this.map.width - 1) return;
    const asset: Asset = new Asset(owner, type, x, y);
    for (let xpos = x; xpos < x + asset.width; xpos++) {
      for (let ypos = y; ypos < y + asset.height; ypos++) {
        if (this.map.assetLayer[ypos][xpos] !== undefined) { console.log('collision'); return; }
        if (this.map.terrainLayer[ypos][xpos] !== TileType.LightGrass && this.map.terrainLayer[ypos][xpos] !== TileType.DarkGrass) { console.log('terraincollision'); return; }
        this.map.assetLayer[ypos][xpos] = asset;
      }
    }
    this.map.assets.push(asset);
    console.log('pushed');

    this.map.assetsUpdated.next({y: coord.y, x: coord.x, width: asset.width, height: asset.height});
  }

  /**
   * Remove any assets placed invalidly within the given region.
   * @param reg The region to check for Assets.
   */
  public removeInvalidAsset(reg: Region) {
    for (let y = reg.y; y < reg.y + reg.height; y++) {
      for (let x = reg.x; x < reg.x + reg.width; x++) {
        if (this.map.assetLayer[y][x] !== undefined && this.map.terrainLayer[y][x] !== TileType.LightGrass && this.map.terrainLayer[y][x] !== TileType.DarkGrass) {
          const assetToBeRemoved = this.map.assetLayer[y][x];
          this.map.assets.splice(this.map.assets.indexOf(assetToBeRemoved), 1);
          console.log('removed asset', assetToBeRemoved);
          for (let xpos = assetToBeRemoved.x; xpos < assetToBeRemoved.x + assetToBeRemoved.width; xpos++) {
            for (let ypos = assetToBeRemoved.y; ypos < assetToBeRemoved.y + assetToBeRemoved.height; ypos++) {
              this.map.assetLayer[ypos][xpos] = undefined;
            }
          }
        }
      }
    }
  }

  // TODO why do we need this? UserService should keep track of the selected assets and then apply the change of ownership to them.
  /**
  * Updates the owner ID of an asset at requested position.
  * @param x x-coord of asset to be updated
  * @param y y-coord of asset to be updated
  * @param newOwner the new owner ID of asset to be updated
  */
  public updateOwner(x: number, y: number, newOwner: number) {
    // invalid owner
    if (newOwner < 0 || newOwner > 7) throw Error('invalid player number');

    // check if asset DNE at requested position
    if (this.map.assetLayer[y][x] !== undefined) {
      this.map.assetLayer[y][x].owner = newOwner;
    }
  }
}
