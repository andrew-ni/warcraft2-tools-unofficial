import { Injectable } from '@angular/core';

import { ipcRenderer } from 'electron';


import { AssetType } from 'asset';
import * as fs from 'fs';
import * as JSZip from 'jszip';
import { join as pathJoin, parse as pathParse } from 'path';

@Injectable()
export class FileService {

  private root = new JSZip();
  private img: JSZip;
  private snd: JSZip;

  private readonly defaultPath = 'data/';

  constructor() {
    ipcRenderer.on('map:loaded', (event: Electron.IpcMessageEvent, filePath: string) => {

      if (pathParse(filePath).ext === '.zip') {  // check if package
        fs.readFile(filePath, async (err: Error, data: Buffer) => {
          if (err) { console.log(err); }

          this.root = await this.root.loadAsync(data);
          this.img = this.root.folder('img/');
          this.snd = this.root.folder('snd');
          this.getImg(AssetType.Terrain); // TEMP
        });
      }
    });

  }

  public async getImg(type: AssetType) {

    const parseRelativePath = (fileData: string) => {
      const [, relativePath, , ] = fileData.split(/#.*?\r?\n/);
      return relativePath.trim();
    };

    const readDataFile = (fileName: string) => {
      return new Promise<string>((resolve, reject) => {
        fs.readFile(this.defaultPath + 'img/' + fileName + '.dat', 'utf8', (err, data) => {
          if (err) { console.error(err); reject(err); }
          resolve(data);
        });
      });
    };

    {
      const assetName = AssetType[type];

      const data = await readDataFile(assetName);
      const relativePath = parseRelativePath(data);

      const file = this.img.file(pathJoin(relativePath));
      const image = await createImageBitmap(await file.async('blob'));


      // TEMP
      const canvas = document.createElement('canvas');
      document.getElementById('main').appendChild(canvas);
      const context = canvas.getContext('2d');

      canvas.width = image.width;
      canvas.height = image.height;

      context.drawImage(image, 0, 0);

    }
  }

  private async getAsset(src: JSZip) {

  }


}
