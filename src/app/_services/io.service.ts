import { Injectable } from '@angular/core';
import { Asset, AssetType } from 'asset';
import { ipcRenderer } from 'electron';
import { Dimension } from 'interfaces';
import { Player } from 'player';
import { Subject } from 'rxjs/Rx';
import { MapService } from 'services/map.service';
import { SerializeService } from 'services/serialize.service';
import { SpriteService } from 'services/sprite.service';
import { TerrainService } from 'services/terrain.service';
import { Tile, TileType } from 'tile';
import { Tileset } from 'tileset';

import * as fs from 'fs';
import * as JSZip from 'jszip';
import * as path from 'path';

const { dialog } = require('electron').remote;

interface IMap {
  canSave: boolean;
  name: string;
  description: string;
  width: number;
  height: number;
  terrainLayer: TileType[][];
  drawLayer: Tile[][];
  partialBits: Uint8Array[];
  players: Player[];
  assets: Asset[];
  assetLayer: Asset[][];
  terrainPath: string;
  tileSet: Tileset;
  mapProjectOpened: Subject<JSZip>;
  mapResized: Subject<Dimension>;
  mapLoaded: Subject<void>;
  mapVersion: string;
}


@Injectable()
export class IOService {

  private _packageFilePath: string;
  private map: IMap;
  private zip: JSZip;
  private mapFileName: string;

  constructor(
    mapService: MapService,
    private terrainService: TerrainService,
    private serializeService: SerializeService,
    private spriteService: SpriteService,
  ) {
    this.map = mapService;

    /**
     * Event listener for when a map has been loaded from a file
     * `mapData` is the raw file contents as a string
     */
    ipcRenderer.on('map:loaded', (event: Electron.IpcMessageEvent, filePath: string) => {
      this._packageFilePath = filePath;

      fs.readFile(filePath, async (err, data) => {
        if (err) { console.error(err); return; }

        this.zip = new JSZip();
        if (path.parse(filePath).ext === '.zip') {  // check if package
          await this.zip.loadAsync(data);
          const mapFile: JSZip.JSZipObject = await this.zip.file(/.+\.map/)[0]; // only open first file
          const mapData: string = await mapFile.async('text');
          this.mapFileName = await mapFile.name;    // save filename for later saving

          this.serializeService.initMapFromFile(mapData, filePath);
        } else {
          this.serializeService.initMapFromFile(data.toString('utf8'), filePath);
        }

        this.zip.folder('img');
        this.zip.folder('snd');
        this.zip.folder('scripts');
        this.map.mapProjectOpened.next(this.zip);
      });
    });

    /**
     * Event listener for when we want to save the map
     */
    ipcRenderer.on('menu:file:save', async (event: Electron.IpcMessageEvent, filePath?: string) => {
      if (filePath) {
        this._packageFilePath = filePath;    // update our save location
      }

      const response: string = this.serializeService.serializeMap();

      if (response === undefined) {
        console.warn('save-map rejected because Map returned null');
        // TODO: add save-failed message

        return; // don't make ipc call
      }

      // implement package generation here
      // save map into zip
      this.zip.file(this.mapFileName, response);    // overwrite file with new response
      // save custom images
      // save custom sounds
      // include scripts


      /**
       * Use save as if the map is created by the editor
       */
      if (this._packageFilePath === undefined) {
        this._packageFilePath = dialog.showSaveDialog({
          filters: [
            { name: 'Map Package (.zip)', extensions: ['zip'] }
          ]
        });
      }
      if (this._packageFilePath === undefined) {
        return;
      }
      console.log('saving...');


      // Save the modified images back out.
      const images = this.spriteService.getModifiedImages();
      for (const { blob, type } of images) {
        this.zip.folder('img').file(AssetType[type] + '.png', blob);
      }

      const file = await this.zip.generateAsync({ type: 'nodebuffer' });
      fs.writeFile(this._packageFilePath, file, err => {
        if (err) console.error(err);
      });
    });

    /**
     * Event listener for once the terrain is loaded, send next event to calcTileIndices(). See terrain.service.ts
     */
    ipcRenderer.on('terrain:loaded', (event: Electron.IpcMessageEvent, terrainData: string) => {
      this.serializeService.parseTileSet(terrainData);
      this.map.mapLoaded.next();
    });

  }
  /**
   * Initialize the map when new menu is used
   * @param name map name created.
   * @param description for the map.
   * @param width width for the map.
   * @param height height for the map.
   * @param fillTile type of tile used to fill default map
   * @param players player number and starting resource
   */
  public initNewMap(name: string, description: string, width: number, height: number, fillTile: TileType, players: Player[]): void {
    this._packageFilePath = undefined;
    this.map.canSave = false;
    this.map.name = name;
    this.map.description = description;
    this.map.width = width;
    this.map.height = height;
    this.map.partialBits = [];
    this.map.terrainLayer = [];
    this.map.assetLayer = [];
    this.map.drawLayer = [];

    for (let y = 0; ; y++) {
      this.map.partialBits.push(Uint8Array.from(new Array(width + 1).fill(0xF)));
      this.map.terrainLayer.push(new Array(width + 1).fill(fillTile));

      if (y >= height) break;

      this.map.assetLayer.push(new Array<Asset>(width));
      this.map.drawLayer.push([]);
      for (let x = 0; x < width; x++) {
        this.map.drawLayer[y].push(new Tile(0));
      }
    }

    this.map.mapVersion = 'v1.0';
    this.map.players = players;
    this.map.assets = [];
    this.map.tileSet = undefined;
    this.map.canSave = true;
    this.map.mapProjectOpened.next(undefined);
    this.map.mapResized.next({ width: this.map.width, height: this.map.height });
  }

}
