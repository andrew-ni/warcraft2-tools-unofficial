import { Injectable } from '@angular/core';

import { Asset, AssetType } from 'asset';
import { Player } from 'player';
import { MapService } from 'services/map.service';
import { TileType } from 'tile';
import { Region } from '../_interfaces';

interface IMap {
  width: number;
  height: number;
  terrainLayer: TileType[][];
  assetLayer: Asset[][];
  players: Player[];
  assets: Asset[];
}

@Injectable()
export class AssetsService {
  private map: IMap;

  constructor(
    mapService: MapService,
  ) {
    this.map = mapService;
  }

  public placeAsset(owner: number, type: AssetType, x: number, y: number, init: boolean = false) {
    console.log(this.map.assets.length);
    if (y < 0 || x < 0 || y > this.map.height - 1 || x > this.map.width - 1) return;

    const asset: Asset = new Asset(owner, type, x, y);
    // checks if cells are occupied
    for (let xpos = x; xpos < x + asset.width; xpos++) {
      for (let ypos = y; ypos < y + asset.height; ypos++) {
        if (this.map.assetLayer[ypos][xpos] !== undefined) { console.log('collision'); return; }
        if (this.map.terrainLayer[ypos][xpos] !== TileType.LightGrass){console.log('terraincollision'); return; }
      }
    }

    if (!init) {
      this.map.assets.push(asset);
      console.log('pushed');
    }

    // placeholder for asset depending on its dimensions
    for (let xpos = x; xpos < x + asset.width; xpos++) {
      for (let ypos = y; ypos < y + asset.height; ypos++) {
        this.map.assetLayer[ypos][xpos] = asset;
      }
    }

    // positional reference point for asset
    this.map.assetLayer[asset.y][asset.x] = asset;
  }

  public removeAsset(reg: Region) {
    for (let y = reg.y; y < reg.y + reg.height; y++) {
      for (let x = reg.x; x < reg.x + reg.width; x++) {
        if (this.map.assetLayer[y][x] !== undefined) {
          if (this.map.terrainLayer[y][x] !== TileType.LightGrass){
            const assetToBeRemoved = this.map.assetLayer[y][x];
            for (let xpos = assetToBeRemoved.x; xpos < assetToBeRemoved.x + assetToBeRemoved.width; xpos++) {
              for (let ypos = assetToBeRemoved.y; ypos < assetToBeRemoved.y + assetToBeRemoved.height; ypos++) {
                this.map.assetLayer[ypos][xpos] = undefined;
              }
            }
          this.map.assets.splice(this.map.assets.indexOf(assetToBeRemoved), 1);
          }
        }
      }
    }
  }

}
