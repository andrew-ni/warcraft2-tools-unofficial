import { ApplicationRef, Injectable } from '@angular/core';
import { ipcRenderer } from 'electron';
import { Subject } from 'rxjs/Rx';

import { Asset, AssetType } from 'asset';
import { Dimension, Region } from 'interfaces';
import { Player } from 'player';
import { AssetsService } from 'services/assets.service';
import { MapService } from 'services/map.service';
import { SoundService } from 'services/sound.service';
import { TerrainService } from 'services/terrain.service';
import { charToTileType, numToChar, Tile, TileType } from 'tile';
import { Tileset } from 'tileset';

/**
 * Narrow IMap interface to discourage access of unrelated attributes
 */
interface IMap {
  canSave: boolean;
  name: string;
  description: string;
  width: number;
  height: number;
  terrainLayer: TileType[][];
  assetLayer: Asset[][];
  drawLayer: Tile[][];
  partialBits: Uint8Array[];
  players: Player[];
  assets: Asset[];
  mapVersion: string;
  terrainPath: string;
  tileSet: Tileset;
  mapResized: Subject<Dimension>;
  assetsUpdated: Subject<Region>;
}

/**
 * SerializeService is the service that manages transformation of MapService
 * as well as reading it from a map data string. It does not intercept / send
 * IO commands, rather it is only responsible for serializing and deserializing
 * the MapService.
 */
@Injectable()
export class SerializeService {
  public static readonly NAME_HEADER = '# Map Name';
  public static readonly DIMENSION_HEADER = '# Map Dimensions W x H';
  public static readonly TERRAIN_HEADER = '# Map Terrain Data';
  public static readonly PARTIAL_BITS_HEADER = '# Map Partial Bits';
  public static readonly PLAYER_NUM_HEADER = '# Number of players';
  public static readonly PLAYER_RESOURCES_HEADER = '# Starting resources Player Gold Lumber';
  public static readonly ASSET_NUM_HEADER = '# Number of assets';
  public static readonly ASSET_DETAIL_HEADER = '# Starting assets Type Owner X Y';
  public static readonly AI_NUM_HEADER = '# Number of scripts';
  public static readonly AI_SCRIPTS_HEADER = '# AI Scripts';
  public static readonly DESCRIPTION_HEADER = '# Map Description';
  public static readonly TILESET_HEADER = '# Map Tileset';

  private map: IMap;

  constructor(
    mapService: MapService,
    private terrainService: TerrainService,
    private assetsService: AssetsService,
    private soundService: SoundService,
    private appRef: ApplicationRef
  ) {
    this.map = mapService;
  }

  // SAVE FUNCTIONS

  /**
   * Converts the contents of MapService to a string that can be re-read and
   * loaded by initMapFromFile()
   */
  public serializeMap(): string {
    // convert the contents of this Map to a string which can be written as configuration
    if (!this.map.canSave) {
      return undefined;    // return undefined to indicate we could not generate a string, thus not calling the save file IO ipc call
    }

    const lines: string[] = [];

    lines.push(this.map.mapVersion);
    lines.push(SerializeService.NAME_HEADER);
    lines.push(this.map.name);
    lines.push(SerializeService.DIMENSION_HEADER);
    lines.push(this.map.width + ' ' + this.map.height);
    lines.push(SerializeService.DESCRIPTION_HEADER);
    lines.push(this.map.description);
    lines.push(SerializeService.TILESET_HEADER);
    lines.push(this.map.terrainPath);
    lines.push(SerializeService.TERRAIN_HEADER);
    for (const yList of this.map.terrainLayer) {
      let line = '';
      for (const tile of yList) {
        line += numToChar[tile];  // write out all tile types
      }
      lines.push(line);
    }

    lines.push(SerializeService.PARTIAL_BITS_HEADER);
    for (const row of this.map.partialBits) {
      let line = '';
      for (const bit of row) {
        line += bit.toString(16).toUpperCase();  // write out all bits
      }
      lines.push(line);
    }

    lines.push(SerializeService.PLAYER_NUM_HEADER);
    lines.push(String(this.map.players.length - 1));    // convert player[] length to string

    lines.push(SerializeService.PLAYER_RESOURCES_HEADER);
    for (const player of this.map.players) {
      lines.push(player.id + ' ' + player.gold + ' ' + player.lumber);
    }

    lines.push(SerializeService.ASSET_NUM_HEADER);
    lines.push(String(this.map.assets.length));

    lines.push(SerializeService.ASSET_DETAIL_HEADER);
    for (const asset of this.map.assets) {
      lines.push(AssetType[asset.type] + ' ' + asset.owner + ' ' + asset.x + ' ' + asset.y);
    }

    return lines.join('\n');  // join all lines with newline
  }

  // PARSE FUNCTIONS
  // TODO: implement exception throwing in order to detect parse failure

  /**
   * Initializes a map from save file. Resets all mapService attributes and
   * calls parseMapData(). Compatible with output from serializeMap()
   * @param mapData Entire file contents in string form
   * @param filePath Map file path (for locality)
   */
  public initMapFromFile(mapData: string, filePath = ''): void {
    this.map.canSave = false;
    this.map.terrainLayer = undefined;
    this.map.assetLayer = undefined;
    this.map.drawLayer = undefined; // move
    this.map.partialBits = undefined;
    this.map.players = [];
    this.map.assets = [];
    this.map.tileSet = undefined;
    this.parseMapData(mapData);
    this.parseSndData();
    console.log('init Map');

    ipcRenderer.send('terrain:load', this.map.terrainPath, filePath);
    // ipcRenderer.send('assets:load', )
  }

  /**
   * Parse a map file contents
   * @param mapData Map file contents
   */
  private parseMapData(mapData: string): void {
    const [mapVersion, name, dimension, mapDescription, terrainPath, terrain, partialbits, , players, , assets] = mapData.split(/#.*?\r?\n/g);
    this.map.mapVersion = mapVersion.trim();
    this.map.name = name.trim();
    [this.map.width, this.map.height] = dimension.trim().split(' ').map((dim) => parseInt(dim, 10));
    this.map.description = mapDescription.trim();
    this.map.terrainPath = terrainPath.trim();
    this.map.terrainLayer = this.parseTerrain(terrain);
    this.map.partialBits = this.parsePartialBits(partialbits);
    this.initAssetLayer();
    this.parseAssets(assets ? assets.trim() : undefined);
    this.map.players = this.parsePlayers(players.trim(), this.map.assets);

    // if execution has reached this point, that means all parsing was completed successfully
    this.map.canSave = true;
    this.map.mapResized.next({ width: this.map.width, height: this.map.height });
    this.map.assetsUpdated.next({ x: 0, y: 0, width: this.map.width, height: this.map.height });
    this.appRef.tick(); // we can optimize this to not update the whole app
  }

  /**
   * @param terrainData string containing entire terrain grid from file
   */
  private parseTerrain(terrainData: string) {
    const terrain: TileType[][] = [];
    this.map.drawLayer = [];
    const rows = terrainData.trim().split(/\r?\n/);

    for (const [index, row] of rows.entries()) {
      terrain.push([]);
      this.map.drawLayer.push([]);

      for (const tileLetter of row.split('')) {
        terrain[index].push(charToTileType[tileLetter]);
        this.map.drawLayer[index].push(new Tile(0));
      }
    }

    return terrain;
  }

  /**
   * @param partialbitsData string containing partial bits grid from file
   */
  private parsePartialBits(partialbitsData: string) {
    const partialbits: Uint8Array[] = [];
    const rows = partialbitsData.trim().split(/\r?\n/);

    for (const [index, row] of rows.entries()) {
      partialbits.push(Uint8Array.from(Array.from(row).map((hex) => parseInt(hex, 16))));
    }

    return partialbits;
  }

  /**
   * @param playersData string containing list of player information
   * @param assets Assets[] array containing assets belonging to players
   */
  private parsePlayers(playersData: string, assets: Asset[]): Player[] {
    const players: Player[] = [];
    const lines = playersData.split(/\r?\n/);

    for (const line of lines) {
      const [id, gold, lumber] = line.split(' ').map((x) => parseInt(x, 10));
      players.push(new Player(id, gold, lumber));
    }

    for (const asset of assets) {
      // players[asset.owner].assets.push(asset); won't work if players aren't listed by id-order
      for (const player of players) {
        if (asset.owner === player.id) {
          player.assets.push(asset);
        }
      }
    }

    return players;
  }

  /**
   * @param assetsData string containing list of assets
   */
  private parseAssets(assetsData: string) {
    if (assetsData === undefined) return;

    const lines = assetsData.split(/\r?\n/);

    for (const line of lines) {
      const [type, owner, x, y] = line.split(' ');
      // .map format is type owner x y, whereas asset construction is owner type x y
      this.assetsService.placeAsset(parseInt(owner, 10), AssetType[type], { x: parseInt(x, 10), y: parseInt(y, 10) }, false);
    }
  }

  /**
   * Sets the tile set, firest first draw event
   * @param terrainData Terrain.dat contents (or specified custom tileset)
   */
  public parseTileSet(terrainData: string): void {
    this.map.tileSet = new Tileset(terrainData);
    // TODO: fire event to start first draw (calc indices, draw onto scren)
    // also draw assets after
  }

  /**
   * Iterates through Asset array and informs assetsService to build the
   * collision map.
   * @param assets Assets list to be processed
   */
  private initAssetLayer() {
    this.map.assetLayer = [];

    for (let row = 0; row < this.map.height; row++) {
      const colIndex = 0;
      this.map.assetLayer.push([]);
      this.map.assetLayer[row] = new Array(this.map.width);
    }
  }

  private parseSndData() {
    const sndData = this.soundService.readSndDat();
    console.log('test');
    console.log(sndData);
  }
}
