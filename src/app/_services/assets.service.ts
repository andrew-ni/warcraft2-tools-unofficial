import { Injectable } from '@angular/core';

import { Asset, AssetType } from 'asset';
import { Player } from 'player';
import { MapService } from 'services/map.service';
import { Tile, TileType } from 'tile';
import { Region } from '../_interfaces';

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


  private isBetween(bottom: number, num: number, top: number) { return num >= bottom && num <= top; }

  /**
   * Places asset on requested position in assets layer. Also handles legality of placement.
   * @param owner owner of asset to be placed
   * @param type type of asset to be placed
   * @param x x-coord of asset to be placed
   * @param y y-coord of asset to be placed
   * @param validate whether to check for valid place, false means force placement.
   */
  public placeAsset(owner: number, type: AssetType, x: number, y: number, validate = true) {

    const validatePlacement = (assetType: AssetType, tileIndex: number) => {
      // if it's a human unit, it can be placed on dirt and grass
      if (assetType <= 3) {
        return (this.isBetween(8, tileIndex, 19) || this.isBetween(91, tileIndex, 122) || this.isBetween(147, tileIndex, 210));
        // otherwise it can only be placed on grass
      } else {
        return (this.isBetween(14, tileIndex, 19) || this.isBetween(179, tileIndex, 210));
      }
    };

    if (y < 0 || x < 0 || y > this.map.height - 1 || x > this.map.width - 1) return;
    if (type === AssetType.GoldMine) { owner = 0; }
    const asset: Asset = new Asset(owner, type, x, y);
    for (let xpos = x; xpos < x + asset.width; xpos++) {
      for (let ypos = y; ypos < y + asset.height; ypos++) {
        if (this.map.assetLayer[ypos][xpos] !== undefined) { console.log('collision'); return; }

        const tileIndex = this.map.drawLayer[ypos][xpos].index;
        if (validate && !validatePlacement(type, tileIndex)) { console.log('terrain collision'); return; }

        this.map.assetLayer[ypos][xpos] = asset;
      }
    }
    this.map.assets.push(asset);
    console.log('pushed');
  }


  /**
   * Remove any assets placed invalidly within the given region.
   * @param reg The region to check for Assets.
   */
  public removeInvalidAsset(reg: Region) {
    for (let y = reg.y; y < reg.y + reg.height; y++) {
      for (let x = reg.x; x < reg.x + reg.width; x++) {
        const theTerrain = this.map.drawLayer[y][x];
        if (this.map.assetLayer[y][x] !== undefined) {
          const theAsset = this.map.assetLayer[y][x];
          console.log('the asset is type: ' + theAsset.type);
          if (theAsset.type <= 3) {
            if (!(this.isBetween(8, theTerrain.index, 19) || this.isBetween(91, theTerrain.index, 122) || this.isBetween(147, theTerrain.index, 210))) {
              this.removeAsset(theAsset);
            }
          } else {
            if (!(this.isBetween(14, theTerrain.index, 19) || this.isBetween(179, theTerrain.index, 210))) {
              this.removeAsset(theAsset);
            }
          }
        }
      }
    }
  }
  /**
   * Removes a single asset
   * @param toBeRemoved asset to be removed
   */
  public removeAsset(toBeRemoved: Asset): void {
    this.map.assets.splice(this.map.assets.indexOf(toBeRemoved), 1);
    console.log('removed asset ', toBeRemoved);
    for (let xpos = toBeRemoved.x; xpos < toBeRemoved.x + toBeRemoved.width; xpos++) {
      for (let ypos = toBeRemoved.y; ypos < toBeRemoved.y + toBeRemoved.height; ypos++) {
        this.map.assetLayer[ypos][xpos] = undefined;
      }
    }
    console.log(this.map.assetLayer);
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
