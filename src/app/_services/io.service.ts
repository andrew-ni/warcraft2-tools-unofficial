import { Injectable } from '@angular/core';
import { Asset, AssetType } from 'asset';
import { ipcRenderer } from 'electron';
import * as fs from 'fs';
import { Dimension } from 'interfaces';
import { Player } from 'player';
import { Subject } from 'rxjs/Rx';
import { MapService } from 'services/map.service';
import { SerializeService } from 'services/serialize.service';
import { SpriteService } from 'services/sprite.service';
import { TerrainService } from 'services/terrain.service';
import { Tile, TileType } from 'tile';
import { Tileset } from 'tileset';
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
  mapResized: Subject<Dimension>;
  mapLoaded: Subject<void>;
  mapVersion: string;
}

@Injectable()
export class IOService {

  private _mapFilePath: string;
  private map: IMap;
  public readonly TERRAIN_PNG_HEIGHT = 32;
  public readonly TERRAIN_PNG_WIDTH = 32;


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
    ipcRenderer.on('map:loaded', (event: Electron.IpcMessageEvent, mapData: string, filePath: string) => {
      this._mapFilePath = filePath;
      this.serializeService.initMapFromFile(mapData, filePath);
    });

    /**
     * Event listener for when we want to save the map
     */
    ipcRenderer.on('menu:file:save', (event: Electron.IpcMessageEvent, filePath?: string) => {
      if (filePath) {
        this._mapFilePath = filePath;    // update our save location
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
      if (this._mapFilePath === undefined) {
        this._mapFilePath = dialog.showSaveDialog({
          filters: [
            { name: 'Map File (.map)', extensions: ['map'] }
          ]
        });
      }
      if (this._mapFilePath === undefined) {
        return;
      }
      console.log('saving...');
      ipcRenderer.send('map:save', response, this._mapFilePath);
    });

    /**
     * Event listener for once the terrain is loaded, send next event to calcTileIndices(). See terrain.service.ts
     */
    ipcRenderer.on('terrain:loaded', (event: Electron.IpcMessageEvent, terrainData: string) => {
      this.serializeService.parseTileSet(terrainData);
      this.map.mapLoaded.next();
    });

    ipcRenderer.on('menu:file:loadtilesetimg', async (event: Electron.IpcMessageEvent, filepath) => {
      const img = new Image();
      const TERRAIN_PNG_HEIGHT = 10304;
      const TERRAIN_PNG_WIDTH = 32;

      const onLoaded = async function() {
        await spriteService.updatePNG(AssetType.Terrain);
        await mapService.mapLoaded.next;
      };

      img.onload = function(){
        const resolve = require('path').resolve;

        if ((img.height === TERRAIN_PNG_HEIGHT && img.width === TERRAIN_PNG_WIDTH)) {
          console.log('Copying:', filepath, 'to:', resolve('../../../testing.png'));
          fs.createReadStream(filepath).pipe(fs.createWriteStream('../../../testing.png'));
          onLoaded();
        } else {
          console.log('DIMENSIONS INVALID');
        }
      };
      img.src = filepath;
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
    this._mapFilePath = undefined;
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
    this.map.terrainPath = '../img/Terrain.dat';
    ipcRenderer.send('terrain:load', this.map.terrainPath, '');
    this.map.canSave = true;
    this.map.mapResized.next({ width: this.map.width, height: this.map.height });
  }
}


// const img = new Image();

//       img.onload = function(){
//         const height = img.height;
//         const width = img.width;
//         const resolve = require('path').resolve;

//         if ((height % TERRAIN_PNG_HEIGHT === 0) && (width % TERRAIN_PNG_WIDTH === 0)) {

//           // for testing
//           console.log('Copying:', filepath, 'to:', resolve('../../../testing.png'));
//           fs.createReadStream(filepath).pipe(fs.createWriteStream('../../../testing.png'));

//           // console.log('Copying:', filepath, 'to:', resolve('img/Terrain.png'));
//           // fs.createReadStream(filepath).pipe(fs.createWriteStream('img/Terrain.png'));

//           // spriteService.updatePNG(AssetType.Terrain);
//           // mapService.mapLoaded.next(null);
//         } else {
//           console.log('DIMENSIONS INVALID');
//         }
//       };
//       img.src = filepath;

//       // this.spriteService.updatePNG(AssetType.Terrain);
//       // this.map.mapLoaded.next();
