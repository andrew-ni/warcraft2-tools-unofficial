import { Injectable } from '@angular/core';

import { Asset, AssetType } from 'asset';
import { Player } from 'player';
import { MapService } from 'services/map.service';
import { TileType } from 'tile';
import { Region } from '../_interfaces';

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
  public placeAsset(owner: number, type: AssetType, x: number, y: number) {
    if (y < 0 || x < 0 || y > this.map.height - 1 || x > this.map.width - 1) return;
    const asset: Asset = new Asset(owner, type, x, y);
    for (let xpos = x; xpos < x + asset.width; xpos++) {
      for (let ypos = y; ypos < y + asset.height; ypos++) {
        if (this.map.assetLayer[ypos][xpos] !== undefined) { console.log('collision'); return; }

        const theAsset = this.map.assetLayer[ypos][xpos];
        const theTerrain = this.map.terrainLayer[ypos][xpos];
        // if it's a human unit, it can be placed on dirt and grass
          if (asset.type === 0 || asset.type === 1 || asset.type === 2 || asset.type === 3) {
            if (theTerrain !== TileType.LightGrass && theTerrain !== TileType.DarkGrass && theTerrain !== TileType.LightDirt && theTerrain !== TileType.DarkDirt) {
              console.log('terrain collision');
              return;
            }
        // otherwise it can only be placed on grass
          } else {
            if (theTerrain !== TileType.LightGrass && theTerrain !== TileType.DarkGrass) {
              console.log('terrain collision');
              return;
            }
          }
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
        const theTerrain = this.map.terrainLayer[y][x];
        if (this.map.assetLayer[y][x] !== undefined) {
          const theAsset = this.map.assetLayer[y][x];
          console.log('the asset is type: ' + theAsset.type);
          if (theAsset.type === 0 || theAsset.type === 1 || theAsset.type === 2 || theAsset.type === 3) {
            if (theTerrain !== TileType.LightGrass && theTerrain !== TileType.DarkGrass && theTerrain !== TileType.LightDirt && theTerrain !== TileType.DarkDirt) {
              this.removeAsset(theAsset);
            }
        } else {
          if (theTerrain !== TileType.LightGrass && theTerrain !== TileType.DarkGrass ) {
            this.removeAsset(theAsset);
          }
        }
        // if (this.map.assetLayer[y][x] !== undefined && this.map.terrainLayer[y][x] !== TileType.LightGrass && this.map.terrainLayer[y][x] !== TileType.DarkGrass) {
        //   const assetToBeRemoved = this.map.assetLayer[y][x];
        //   this.removeAsset(assetToBeRemoved);
        // this.map.assets.splice(this.map.assets.indexOf(assetToBeRemoved), 1);
          // console.log('removed asset', assetToBeRemoved);
          // for (let xpos = assetToBeRemoved.x; xpos < assetToBeRemoved.x + assetToBeRemoved.width; xpos++) {
          //   for (let ypos = assetToBeRemoved.y; ypos < assetToBeRemoved.y + assetToBeRemoved.height; ypos++) {
          //     this.map.assetLayer[ypos][xpos] = undefined;
          //   }
          // }
      }
    }
  }
}
/**
 *
 * @param toBeRemoved asset to be removed
 */
  public removeAsset(toBeRemoved: Asset): void {
    this.map.assets.splice(this.map.assets.indexOf(toBeRemoved), 1);
    console.log('removed asset ', toBeRemoved);
    for (let xpos = toBeRemoved.x; xpos < toBeRemoved.x + toBeRemoved.width; xpos++){
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
