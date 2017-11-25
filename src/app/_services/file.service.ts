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
}

@Injectable()
export class FileService {

  private root = new JSZip();
  private img: JSZip;
  private snd: JSZip;

  private readonly defaultPath = 'data/';

  public initializing: Promise<void>;

  private map: IMap;

  constructor(
    mapService: MapService,
  ) {
    this.map = mapService;

    let resolve: () => void;
    this.initializing = new Promise<void>(res => resolve = res);

    this.map.mapProjectOpened.subscribe(zip => {
      this.root = zip;
      this.img = (zip === undefined) ? undefined : zip.folder('img');
      this.snd = (zip === undefined) ? undefined : zip.folder('snd');
      resolve();
      this.map.mapProjectLoaded.next();
    });
  }

  public async getImg(type: AssetType) {

    const parseRelativePath = (fileData: string) => {
      const [, relativePath] = fileData.split(/#.*?\r?\n/);
      return relativePath.trim();
    };

    const readDataFile = (fileName: string) => {
      return new Promise<string>((resolve, reject) => {
        fs.readFile(pathJoin(this.defaultPath, 'img/', fileName + '.dat'), 'utf8', (err, data) => {
          if (err) { console.error(err); reject(err); }
          resolve(data);
        });
      });
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

      const fileData = await readDataFile(assetName);
      const relativePath = parseRelativePath(fileData);

      const customAssetFile = (this.img === undefined) ? null : this.img.file(pathJoin(relativePath));

      return (customAssetFile === null)
        ? { isCustom: false, fileData, image: await createImageBitmap(await readImageFile(relativePath)) }   // load default asset.
        : { isCustom: true, fileData, image: await createImageBitmap(await customAssetFile.async('blob')) }; // load custom asset.
    }
  }
}
