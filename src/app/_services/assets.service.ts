import { Injectable } from '@angular/core';

import { Asset, AssetType } from 'asset';
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

  /**
   * Places asset on requested position in assets layer. Also handles legality of placement.
   * @param owner owner of asset to be placed
   * @param type type of asset to be placed
   * @param x x-coord of asset to be placed
   * @param y y-coord of asset to be placed
   * @param init check if method is called during assets layer init
   */
  public placeAsset(owner: number, type: AssetType, x: number, y: number, init: boolean = false) {
    if (y < 0 || x < 0 || y > this.map.height - 1 || x > this.map.width - 1) return;

    const asset: Asset = new Asset(owner, type, x, y);
    // checks if cells are occupied
    for (let xpos = x; xpos < x + asset.width; xpos++) {
      for (let ypos = y; ypos < y + asset.height; ypos++) {
        if (this.map.assetLayer[ypos][xpos] !== undefined) { console.log('collision'); return; }
        if (this.map.terrainLayer[ypos][xpos] !== TileType.LightGrass) { console.log('terraincollision'); }
      }
    }

    if (!init) {
      this.map.assets.push(asset);
      console.log('pushed');
    }

    // placeholder for asset depending on its dimensions
    for (let xpos = x; xpos < x + asset.width; xpos++) {
      for (let ypos = y; ypos < y + asset.height; ypos++) {
        this.map.assetLayer[ypos][xpos] = new Asset(owner, AssetType.Placeholder, xpos, ypos, asset);
      }
    }

    // positional reference point for asset
    this.map.assetLayer[asset.y][asset.x] = asset;
  }

  /**
  * Removes asset in assets layer at specified position.
  * @param x x-coord of asset to be removed
  * @param y y-coord of asset to be removed
  */
  public removeAsset(x: number, y: number) {
    if (this.map.assetLayer[y][x] === undefined) {
      return;
    }

    const assetToBeRemoved = this.map.assetLayer[y][x].referenceAsset;

    this.map.assets.splice(this.map.assets.indexOf(assetToBeRemoved), 1);

    for (let xpos = assetToBeRemoved.x; xpos < assetToBeRemoved.x + assetToBeRemoved.width; xpos++) {
      for (let ypos = assetToBeRemoved.y; ypos < assetToBeRemoved.y + assetToBeRemoved.height; ypos++) {
        this.map.assetLayer[ypos][xpos] = undefined;
      }
    }
  }

  /**
  * Updates the owner ID of an asset at requested position.
  * @param x x-coord of asset to be updated
  * @param y y-coord of asset to be updated
  * @param newOwner the new owner ID of asset to be updated
  */
  public updateOwner(x: number, y: number, newOwner: number) {
    let originalAsset: Asset;

    // invalid owner
    if (newOwner < 0 || newOwner > 7) {
      return;
    }

    // check if asset DNE at requested position
    if (this.map.assetLayer[y][x].referenceAsset === undefined) {
      console.log(this.map.assetLayer[y][x].referenceAsset);
      return;
    } else {
      originalAsset = this.map.assetLayer[y][x].referenceAsset;
    }

    // locate index of updated asset
    let index = -1;
    for (let i = 0; i < this.map.assets.length; i++) {
      if (originalAsset.x === this.map.assets[i].x && originalAsset.y === this.map.assets[i].y) {
        index = i;
        break;
      }
    }

    // update assets array
    this.map.assets.splice(index, 1);
    this.map.assets.push(new Asset(newOwner, originalAsset.type, originalAsset.x, originalAsset.y));

    // update owner information in asset layer
    for (let xpos = originalAsset.x; xpos < originalAsset.x + originalAsset.width; xpos++) {
      for (let ypos = originalAsset.y; ypos < originalAsset.y + originalAsset.height; ypos++) {
        this.map.assetLayer[ypos][xpos].owner = newOwner;
      }
    }
  }

}
