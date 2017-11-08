import { Injectable } from '@angular/core';

import { Asset, AssetType, Structure, Unit } from 'asset';
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
  private unitTypes: Set<AssetType>;
  private structureTypes: Set<AssetType>;

  constructor(
    mapService: MapService,
  ) {
    this.map = mapService;
    this.unitTypes = new Set<AssetType>([AssetType.Peasant, AssetType.Footman, AssetType.Ranger, AssetType.Archer]);
    this.structureTypes = new Set<AssetType>([AssetType.Barracks, AssetType.Blacksmith, AssetType.CannonTower,
        AssetType.Castle, AssetType.Farm, AssetType.GoldMine, AssetType.GuardTower, AssetType.Keep, AssetType.LumberMill,
        AssetType.ScoutTower, AssetType.TownHall, AssetType.Wall]);
  }


  /**
   * Places asset on requested position in assets layer. Also handles legality of placement.
   * @param owner owner of asset to be placed
   * @param type type of asset to be placed
   * @param x x-coord of asset to be placed
   * @param y y-coord of asset to be placed
   * @param validate whether to check for valid place, false means force placement.
   */
  public placeAsset(owner: number, type: AssetType, x: number, y: number, validate: boolean) {

    if (y < 0 || x < 0 || y > this.map.height - 1 || x > this.map.width - 1) return;
    let asset: Asset;

    if (this.unitTypes.has(type)) {
      asset = new Unit(owner, type, x, y);
    } else if (this.structureTypes.has(type)) {
      asset = new Structure(owner, type, x, y);
    } else return;

    for (let ypos = y; ypos < y + asset.height; ypos++) {
      for (let xpos = x; xpos < x + asset.width; xpos++) {
        if (this.map.assetLayer[ypos][xpos] !== undefined) { console.log('collision'); return; }
        const tileType = this.map.drawLayer[ypos][xpos].tileType;
        if (validate && !(asset.validTiles.has(tileType))) { console.log('terrain collision'); return; }
      }
    }

    for (let ypos = y; ypos < y + asset.height; ypos++) {
      for (let xpos = x; xpos < x + asset.width; xpos++) {
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
        if (this.map.assetLayer[y][x] !== undefined) {
          const theTerrain = this.map.drawLayer[y][x];
          const theAsset = this.map.assetLayer[y][x];
          if (!(theAsset.validTiles.has(theTerrain.tileType))) {this.removeAsset(theAsset); }
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
    for (let ypos = toBeRemoved.y; ypos < toBeRemoved.y + toBeRemoved.height; ypos++) {
      for (let xpos = toBeRemoved.x; xpos < toBeRemoved.x + toBeRemoved.width; xpos++) {
        this.map.assetLayer[ypos][xpos] = undefined;
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
