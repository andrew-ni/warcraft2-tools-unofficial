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
}
