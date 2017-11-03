import { TileType, Tile, numToTileType, strToTileType, numToChar, charToTileType, TileTypeChar } from './tile';
import { Player } from './player';
import { Asset, Unit, Structure, AssetType, strToAssetType } from './asset';
import { Tileset } from './tileset';
import { Subject, Observer, Observable } from 'rxjs/Rx';
import { Coordinate, Dimension, Region } from 'interfaces';
import { ipcRenderer } from 'electron';

export class MapObject {

  // Headers are for stringify(), which needs them to output map comments
  static NAME_HEADER = '# Map Name';
  static DIMENSION_HEADER = '# Map Dimensions W x H';
  static TERRAIN_HEADER = '# Map Terrain Data';
  static PARTIAL_BITS_HEADER = '# Map Partial Bits';
  static PLAYER_NUM_HEADER = '# Number of players';
  static PLAYER_RESOURCES_HEADER = '# Starting resources Player Gold Lumber';
  static ASSET_NUM_HEADER = '# Number of assets';
  static ASSET_DETAIL_HEADER = '# Starting assets Type Owner X Y';
  static AI_NUM_HEADER = '# Number of scripts';
  static AI_SCRIPTS_HEADER = '# AI Scripts';
  static DESCRIPTION_HEADER = '# Map Description';
  static TILESET_HEADER = '# Map Tileset';

  // map status flags
  public canSave = false; // save state is not ready yet
  public name: string;
  public description: string;
  public width: number;
  public height: number;
  public terrainLayer: TileType[][];
  public assetLayer: Asset[][];
  public drawLayer: Tile[][];
  public partialBits: Uint8Array[];
  public players: Player[] = [];
  public assets: Asset[] = [];
  public mapVersion: string;
  public terrainPath: string;
  public tileSet: Tileset;


  // `mapData` is the raw file contents
  // TODO: move event listener to mapservice, add method to set tileset
  constructor() { }




  // public initNew(name: string, description: string, width: number, height: number, fillTile: TileType, players: Player[]): void {
  //   this.canSave = false;
  //   this.name = name;
  //   this.description = description;
  //   this.width = width;
  //   this.height = height;

  //   const terrain: TileType[][] = [];
  //   const partialbits: Uint8Array[] = [];

  //   for (let y = 0; y < height + 1; y++) {
  //     terrain.push([]);

  //     partialbits.push(Uint8Array.from(new Array(width).fill(0xF)));

  //     for (let x = 0; x < width + 1; x++) {
  //       terrain[y].push(fillTile);
  //     }
  //   }
  //   this.terrainLayer = terrain;
  //   this.partialBits = partialbits;

  //   this.players = players;
  //   this.assets = [];
  //   this.tileSet = undefined;
  //   this.terrainPath = '../img/Terrain.dat';
  //   ipcRenderer.send('terrain:load', this.terrainPath, '');

  //   this.canSave = true;
  //   this._mapLoaded.next({ width: this.width, height: this.height });
  // }






  // SAVE LOGIC

  public stringify(): string {
    // convert the contents of this Map to a string which can be written as configuration
    if (!this.canSave) {
      return undefined;    // return undefined to indicate we could not generate a string, thus not calling the save file IO ipc call
    }

    const lines: string[] = [];

    lines.push(this.mapVersion);
    lines.push(MapObject.NAME_HEADER);
    lines.push(this.name);
    lines.push(MapObject.DIMENSION_HEADER);
    lines.push(this.width + ' ' + this.height);
    lines.push(MapObject.DESCRIPTION_HEADER);
    lines.push(this.description);
    lines.push(MapObject.TILESET_HEADER);
    lines.push(this.terrainPath);
    lines.push(MapObject.TERRAIN_HEADER);
    for (const yList of this.terrainLayer) {
      let line = '';
      for (const tile of yList) {
        line += numToChar[tile];  // write out all tile types
      }
      lines.push(line);
    }

    lines.push(MapObject.PARTIAL_BITS_HEADER);
    for (const row of this.partialBits) {
      let line = '';
      for (const bit of row) {
        line += bit.toString(16).toUpperCase();  // write out all bits
      }
      lines.push(line);
    }

    lines.push(MapObject.PLAYER_NUM_HEADER);
    lines.push(String(this.players.length - 1));    // convert player[] length to string

    lines.push(MapObject.PLAYER_RESOURCES_HEADER);
    for (const player of this.players) {
      lines.push(player.id + ' ' + player.gold + ' ' + player.lumber);
    }

    lines.push(MapObject.ASSET_NUM_HEADER);
    lines.push(String(this.assets.length));

    lines.push(MapObject.ASSET_DETAIL_HEADER);
    for (const asset of this.assets) {
      lines.push(asset.type + ' ' + asset.owner + ' ' + asset.x + ' ' + asset.y);
    }

    return lines.join('\n');  // join all lines with newline
  }



  public placeAsset(owner: number, type: AssetType, x: number, y: number, init: boolean = false) {
    if (y < 0 || x < 0 || y > this.height - 1 || x > this.width - 1) return;

    const asset: Asset = new Asset(owner, type, x, y);
    // checks if cells are occupied
    for (let xpos = x; xpos < x + asset.width; xpos++) {
      for (let ypos = y; ypos < y + asset.height; ypos++) {
        if (this.assetLayer[ypos][xpos] !== undefined) { console.log('collision'); return; }
      }
    }

    if (!init) {
      this.assets.push(asset);
      console.log('pushed');
    }

    // placeholder for asset depending on its dimensions
    for (let xpos = x; xpos < x + asset.width; xpos++) {
      for (let ypos = y; ypos < y + asset.height; ypos++) {
        this.assetLayer[ypos][xpos] = new Asset(asset.owner, strToAssetType['Placeholder'], xpos, ypos, asset);
      }
    }

    // positional reference point for asset
    this.assetLayer[asset.y][asset.x] = asset;
  }

  private removeAsset(x: number, y: number) {
    if (this.assetLayer[y][x] === undefined) {
      return;
    }

    const assetToBeRemoved = this.assetLayer[y][x].referenceAsset;

    this.assets.splice(this.assets.indexOf(assetToBeRemoved), 1);

    for (let xpos = assetToBeRemoved.x; xpos < assetToBeRemoved.x + assetToBeRemoved.width; xpos++) {
      for (let ypos = assetToBeRemoved.y; ypos < assetToBeRemoved.y + assetToBeRemoved.height; ypos++) {
        this.assetLayer[ypos][xpos] = undefined;
      }
    }
  }
}
