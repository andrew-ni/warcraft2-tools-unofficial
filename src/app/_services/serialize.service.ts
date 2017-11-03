import {Asset, strToAssetType} from 'asset';
import { Injectable } from '@angular/core';
import { MapService } from 'services/map.service';
import { TerrainService } from 'services/terrain.service';
import { AssetsService } from 'services/assets.service';
import { MapObject } from 'map';
import {TileType, charToTileType} from 'tile';
import { Player } from 'player';
import { ipcRenderer } from 'electron';
import { Tileset } from 'tileset';

@Injectable()
export class SerializeService {

  private map: MapObject;

  constructor(
    private mapService: MapService,
    private terrainService: TerrainService,
    private assetsService: AssetsService,
  ) {
    this.map = this.mapService.map;
  }

    // PARSE FUNCTIONS
  // TODO: implement exception throwing in order to detect parse failure

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
    ipcRenderer.send('terrain:load', this.map.terrainPath, filePath);
    // ipcRenderer.send('assets:load', )
  }

  private parseMapData(mapData: string): void {
    const [mapVersion, name, dimension, mapDescription, terrainPath, terrain, partialbits, , players, , assets] = mapData.split(/#.*?\r?\n/g);
    this.map.mapVersion = mapVersion.trim();
    this.map.name = name.trim();
    [this.map.width, this.map.height] = dimension.trim().split(' ').map((dim) => parseInt(dim, 10));
    this.map.description = mapDescription.trim();
    this.map.terrainPath = terrainPath.trim();
    this.map.terrainLayer = this.parseTerrain(terrain);
    this.map.partialBits = this.parsePartialBits(partialbits);
    this.map.assets = this.parseAssets(assets.trim());
    this.map.players = this.parsePlayers(players.trim(), this.map.assets);
    this.initAssetLayer(this.map.assets);

    // if execution has reached this point, that means all parsing was completed successfully
    this.map.canSave = true;
    this.mapService.mapLoaded.next({ width: this.map.width, height: this.map.height });
  }

  private parseTerrain(terrainData: string) {
    const terrain: TileType[][] = [];
    // this.drawLayer = [];
    const rows = terrainData.trim().split(/\r?\n/);

    for (const [index, row] of rows.entries()) {
      terrain.push([]);
      // this.drawLayer.push([]);

      for (const tileLetter of row.split('')) {
        terrain[index].push(charToTileType[tileLetter]);
        // this.drawLayer[index].push(new Tile(0));
      }
    }

    return terrain;
  }

  private parsePartialBits(partialbitsData: string) {
    const partialbits: Uint8Array[] = [];
    const rows = partialbitsData.trim().split(/\r?\n/);

    for (const [index, row] of rows.entries()) {
      partialbits.push(Uint8Array.from(Array.from(row).map((hex) => parseInt(hex, 16))));
    }

    return partialbits;
  }

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

  private parseAssets(assetsData: string): Asset[] {
    const parsedAssets: Asset[] = [];
    const lines = assetsData.split(/\r?\n/);

    for (const line of lines) {
      const [type, owner, x, y] = line.split(' ');
      // .map format is type owner x y, whereas asset construction is owner type x y
      parsedAssets.push(new Asset(parseInt(owner, 10), strToAssetType[type], parseInt(x, 10), parseInt(y, 10)));
    }

    return parsedAssets;
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

  private initAssetLayer(assets: Asset[]) {
    const assetLayer: Asset[][] = [];

    for (let row = 0; row < this.map.height; row++) {
      const colIndex = 0;
      assetLayer.push([]);
      assetLayer[row] = new Array(this.map.width);
    }

    this.map.assetLayer = assetLayer;   // copy in the newly initialized asset layer

    for (const asset of assets) {
      this.map.placeAsset(asset.owner, asset.assetType, asset.x, asset.y, true);
    }

    // console.log(assetLayer);
  }
}
