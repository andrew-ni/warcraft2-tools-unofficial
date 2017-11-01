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
    // Load assets before, and independently of map:loaded.
    this.fs = require('fs');
    this.path = require('path');
    this.loadAssets();
  }



  // TODO: read the .dat files for more information, filter readdir()
  // Finds files in /assets/img/, and replaces .dat with .png.
  // Creates Image() for each then inserts <string, image> into assetMap.
  private loadAssets() {
    const myPath = './src/assets/img/';
    const myFiles = this.fs.readdirSync(myPath);

    for (const i in myFiles) {
      if (this.path.extname(myFiles[i]) === '.dat') {
        const temp = String(myFiles[i]);
        const temp2 = temp.substring(0, temp.length - 4);

        const tempImage = new Image();
        tempImage.src = 'assets/img/' + temp2 + '.png';
        this.assetMap.set(strToAssetType[temp2], tempImage);
      }
    }
  }

  // Draws Map when loaded from file.
  public drawMap(reg: Region = { x: 0, y: 0, width: this.map.width, height: this.map.height }): void {
    if (reg.y < 0) reg.y = 0;
    if (reg.x < 0) reg.x = 0;
    if (reg.y + reg.height > this.map.height) reg.height = this.map.height - reg.y;
    if (reg.x + reg.width > this.map.width) reg.width = this.map.width - reg.x;
    const terrain = this.assetMap.get(AssetType.Terrain);
    for (let x = reg.x; x < reg.x + reg.width; x++) {
      for (let y = reg.y; y < reg.y + reg.width; y++) {
        this.drawImage(terrain, terrain.width, y, x, this.map.drawLayer[y][x].index);
      }
    }
  }

  // Draws Assets layer using Assets[] array from map.ts
  public drawAssets(yStart: number = 0, xStart: number = 0, height: number = this.map.height, width: number = this.map.width): void {
    for (const asset of this.map.assets) {
      const img = this.assetMap.get(asset.assetType);
      this.drawImage(img, img.width, asset.y, asset.x, 0);
    }
  }

  // PARMS: image (assetMap.get(imgName), width (use image.width), y, x (in 32x32 pixels), index (position on spritesheet)
  private drawImage(image: HTMLImageElement, width: number, y: number, x: number, index: number): void {
    this.context.drawImage(image, 0, index * width, width, width, x * this.TERRAIN_SIZE, y * this.TERRAIN_SIZE, width, width);
  }
}
