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
import * as fsx from 'fs-extra';
import * as JSZip from 'jszip';
import * as path from 'path';
import { saveMapOptions, savePackageOptions } from '../../../main/menubar';

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


/**
 * IOService manages IO, receiving events from menubar, and firing save / load
 * events. It is currently in charge of the packaging process.
 */
@Injectable()
export class IOService {
  /** Custom sound directory for temporary storage of custom sounds. */
  public static readonly CUSTOMSND_DIR = 'data/customSnd';

  /** Package file path, for save map default save location. */
  private openedFilePath: string;

  /** IMap interface for access to map information. */
  private map: IMap;

  /** JSZip object representing current state of package. */
  private zip: JSZip;

  /** String representing the first found .map file in the package. Defaults
   * to map.map
  */
  private mapFileName: string;

  constructor(
    mapService: MapService,
    private terrainService: TerrainService,
    private serializeService: SerializeService,
    private spriteService: SpriteService,
  ) {
    this.map = mapService;
    setTimeout(() => this.openPackage('./map/newTerrain.zip'), 2000);


    /**
     * Event listener for when a map has been loaded from a file
     * `mapData` is the raw file contents as a string
     */
    ipcRenderer.on('map:loaded', (_, filePath: string) => this.openPackage(filePath));

    /**
     * Event listener for when we want to save the map ONLY
     */
    ipcRenderer.on('menu:file:savemap', async (_, filePath?: string) => this.saveMap(filePath));

    /**
     * Event listener for when we want to save the map PACKAGE
     */
    ipcRenderer.on('menu:file:savepackage', async (_, filePath?: string) => this.savePackage(filePath));

    /**
     * Event listener for once the terrain is loaded, send next event to calcTileIndices(). See terrain.service.ts
     */
    ipcRenderer.on('terrain:loaded', (_, terrainData: string) => {
      this.serializeService.parseTileSet(terrainData);
      this.map.mapLoaded.next();
    });
  }

  /**
   * Opens the project zip
   * @param filePath the full path to the map project
   */
  public initPackage() {
    this.mapFileName = 'map.map';
    this.zip = new JSZip();
    this.map.mapProjectOpened.next(this.zip);
  }

  private async openPackage(filePath: string) {
    this.openedFilePath = filePath;

    fs.readFile(filePath, async (err, data) => {
      if (err) { console.error(err); return; }

      this.readPackage(data, path.parse(filePath).ext === '.zip');
    });
  }

  public async readPackage(data: Buffer, isZip: boolean) {
    this.zip = new JSZip();

    if (isZip) {  // check if package
      await this.zip.loadAsync(data);
      const mapFile: JSZip.JSZipObject = await this.zip.file(/.+\.map/)[0]; // only open first file
      const mapData: string = await mapFile.async('text');
      this.mapFileName = await mapFile.name;    // save filename for later saving

      this.extractCustomSnds();

      this.serializeService.initMapFromFile(mapData);
    } else {
      this.serializeService.initMapFromFile(data.toString('utf8'));
    }

    this.zip.folder('img');
    this.zip.folder('snd');
    this.zip.folder('scripts');
    this.map.mapProjectOpened.next(this.zip);
  }

  private saveMap(filePath?: string) {
    if (filePath) {
      this.openedFilePath = filePath;    // update our save location
    }

    const response: string = this.serializeService.serializeMap();

    if (response === undefined) {
      console.warn('save-map rejected because Map returned null');
      // TODO: add save-failed message

      return; // don't make ipc call
    }

    /**
     * Use save as if the map is created by the editor
     */
    if (this.openedFilePath === undefined) {
      this.openedFilePath = dialog.showSaveDialog(saveMapOptions);
    }
    if (this.openedFilePath === undefined) {
      return;
    }
    console.log('saving...');

    fs.writeFileSync(this.openedFilePath, response);
  }

  public async buildPackage() {
    const response: string = this.serializeService.serializeMap();

    /*
    * Insert the map configuration.
    */
    this.zip.file(this.mapFileName, response);    // overwrite file with new response

    /*
     * Add imgs to package.
     */
    this.zip.remove('img');   // empty the folder to remove original edits
    this.zip.folder('img');
    const images = this.spriteService.getModifiedImages();
    console.log(images);
    for (const { blob, type } of images) {
      this.zip.folder('img').file(AssetType[type] + '.png', blob);
    }

    /*
     * Add snds to package.
     */
    // const sounds = ['./peasant/acknowledge1.wav'];
    this.zip.remove('snd');
    this.zip.folder('snd');
    const sounds = [];
    for (const sndPath of sounds) {
      this.zip.folder('snd').file(sndPath, fsx.readFile(path.join(IOService.CUSTOMSND_DIR, sndPath)));
    }

    return this.zip.generateAsync({ type: 'nodebuffer' });
  }

  /**
   * Packages everything into a zip file and saves it out.
   * @param filePath The absolute path to save the map zip.
   */
  public async savePackage(filePath?: string) {
    if (filePath) {
      this.openedFilePath = filePath;    // update our save location
    }


    /**
     * Use save as if the map is created by the editor
     */
    if (this.openedFilePath === undefined) {
      this.openedFilePath = dialog.showSaveDialog(savePackageOptions);
    }
    if (this.openedFilePath === undefined) {
      return;
    }
    console.log('saving...');

    const file = await this.buildPackage();
    /*
     * Dump zip to disk.
     */
    fs.writeFile(this.openedFilePath, file, err => {
      if (err) console.error(err);
    });
  }

  /**
   * Extracts the sounds files from the zip and saves them to CUSTOMSND_DIR
   */
  private async extractCustomSnds() {
    // empty customSnd folder on disk
    await fsx.emptyDir(IOService.CUSTOMSND_DIR);    // create empty custom sound dir

    // foreach folder (populate list of folders)
    const snd = this.zip.folder('snd');
    snd.forEach((dirName, dirFile) => {
      if (dirFile.dir) {   // TODO  see if we can get this from file var
        fs.mkdirSync(path.join(IOService.CUSTOMSND_DIR, dirName));   // make folder, sync to ensure completion

        snd.folder(dirName).forEach(async (name, file) => {       // for each file in the folder
          // console.log(path.join(IOService.CUSTOMSND_DIR, dirName, name));
          fs.writeFile(path.join(IOService.CUSTOMSND_DIR, dirName, name), await file.async('nodebuffer'), err => {
            if (err) console.error(err);
          });
        });
      }
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
    this.openedFilePath = undefined;
    this.map.canSave = false;
    this.map.name = name;
    this.map.description = description;
    this.map.width = width;
    this.map.height = height;
    this.map.partialBits = [];
    this.map.terrainLayer = [];
    this.map.assetLayer = [];
    this.map.drawLayer = [];
    this.initPackage();

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
