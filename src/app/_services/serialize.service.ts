import { Asset, strToAssetType } from 'asset';
import { Injectable } from '@angular/core';
import { MapService } from 'services/map.service';
import { TerrainService } from 'services/terrain.service';
import { AssetsService } from 'services/assets.service';
import { TileType, charToTileType, Tile, numToChar } from 'tile';
import { Player } from 'player';
import { ipcRenderer } from 'electron';
import { Tileset } from 'tileset';

@Injectable()
export class SerializeService {
  // Headers are for stringify(), which needs them to output map comments
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

  private map: MapService;

  constructor(
    private mapService: MapService,
    private terrainService: TerrainService,
    private assetsService: AssetsService,
  ) {
    this.map = this.mapService;
  }

  // SAVE FUNCTIONS

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
      lines.push(asset.type + ' ' + asset.owner + ' ' + asset.x + ' ' + asset.y);
    }

    return lines.join('\n');  // join all lines with newline
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
    console.log('initmMap');

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
    this.mapService.mapResized.next({ width: this.map.width, height: this.map.height });
  }

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
      this.assetsService.placeAsset(asset.owner, asset.assetType, asset.x, asset.y, true);
    }

    // console.log(assetLayer);
  }
}
