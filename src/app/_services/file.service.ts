import { Injectable } from '@angular/core';
import { ipcRenderer } from 'electron';
import * as fs from 'fs';
import * as JSZip from 'jszip';
import { Subject } from 'rxjs/Rx';

import { AssetType } from 'asset';
import { join as pathJoin, parse as pathParse } from 'path';
import { MapService } from 'services/map.service';

interface IMap {
  mapProjectOpened: Subject<JSZip>;
  mapProjectLoaded: Subject<void>;
  baseHref: string;
}

/**
 * FileService manages access to custom and default assets. It does this by
 * providing functions that abstract the access to an asset file. Depending on
 * the contents of the loaded package, FileService will provide the correct
 * file.
 */
@Injectable()
export class FileService {
  private root = new JSZip();
  private img: JSZip;
  private snd: JSZip;

  private readonly defaultPath: string;

  public initializing: Promise<void>;

  /** Access to map */
  private map: IMap;

  constructor(
    mapService: MapService,
  ) {
    this.map = mapService;
    this.defaultPath = pathJoin(this.map.baseHref, 'data');


    let resolve: () => void;
    this.initializing = new Promise<void>(res => resolve = res);

    this.map.mapProjectOpened.subscribe(zip => {
      this.root = zip;
      this.img = (zip === undefined) ? undefined : zip.folder('img');
      this.snd = (zip === undefined) ? undefined : zip.folder('snd');
      resolve();
      // this.getSnd('./peasant/ready.wav');
      this.map.mapProjectLoaded.next();
    });
  }

  /**
   * Gets the ImageBitmap associated with the AssetType provided.
   * @param type AssetType to retrieve.
   * @param reset true to force retrieve default image.
   */
  public async getImg(type: AssetType, reset: boolean = false) {

    const parseRelativePath = (fileData: string) => {
      const [, relativePath] = fileData.split(/#.*?\r?\n/);
      return relativePath.trim();
    };

    const readImageFile = (relativePath: string) => {
      return new Promise<Blob>((resolve, reject) => {
        fs.readFile(pathJoin(this.defaultPath, 'img/', relativePath), (err, data) => {
          if (err) { console.error(err); reject(err); }
          resolve(new Blob([data]));
        });
      });
    };

    {
      const assetName = AssetType[type];

      const fileData = await this.readDataFile('img/', assetName);
      const relativePath = parseRelativePath(fileData);

      const customAssetFile = (this.img === undefined) ? null : this.img.file(pathJoin(relativePath));

      if (reset || customAssetFile === null) {
        return { isCustom: false, fileData, image: await createImageBitmap(await readImageFile(relativePath)) };   // load default asset.
      } else {
        return { isCustom: true, fileData, image: await createImageBitmap(await customAssetFile.async('blob')) }; // load custom asset.

      }
    }
  }


  public async getSnd(relativePath: string) {
    // TODO maybe or sound service can stay as is.
  }

  /**
   * Returns the content of the dat file.
   * @param directory The directory relative to the default path
   * @param fileName the file name (without .dat)
   */
  private async readDataFile(directory: string, fileName: string) {
    return new Promise<string>((resolve, reject) => {
      fs.readFile(pathJoin(this.defaultPath, directory, fileName + '.dat'), 'utf8', (err, data) => {
        if (err) { console.error(err); reject(err); }
        resolve(data);
      });
    });
  }
}
