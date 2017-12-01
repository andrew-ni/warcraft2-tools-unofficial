import { Component, OnInit } from '@angular/core';
import { Menu } from 'electron';

import { AssetType } from 'asset';
import { Coordinate } from 'interfaces';
import { MapService } from 'services/map.service';
import { SpriteService } from 'services/sprite.service';
import { TilesetService } from 'services/tileset.service';

const { dialog } = require('electron').remote;
const options = {
  filters: [
    { name: 'Image File (.png)', extensions: ['png'] }
  ]
};

/**
 * This component deals with the saving, loading, click listeners, and html linking, that the tileset tab requires
 */
@Component({
  selector: 'app-tileset',
  templateUrl: './tileset.component.html',
  styleUrls: ['./tileset.component.scss']
})
export class TilesetComponent implements OnInit {

  /** The canvas displaying the current tileset */
  private tilesetCanvas: HTMLCanvasElement;

  /** The context for the tileset canvas */
  private tilesetContext: CanvasRenderingContext2D;

  /** All possible multiplier options */
  private multiplierOptions = [1, 2, 3];

  constructor(
    private tilesetService: TilesetService,
    private spriteService: SpriteService,
    private mapService: MapService,
  ) { }

  ngOnInit() {
    this.tilesetCanvas = document.getElementById('tilesetCanvas') as HTMLCanvasElement;
    this.tilesetContext = this.tilesetCanvas.getContext('2d');
    this.tilesetService.setCanvas(this.tilesetCanvas, this.tilesetContext);
    this.setClickListeners();
  }

  /**
   * Adds a click listener to the tileset canvas.
   * We can figure out which tile the user wants to replace using their click position
   */
  private setClickListeners() {
    let clickPos: Coordinate;
    this.tilesetCanvas.addEventListener('click', (event) => {
      clickPos = { x: event.offsetX, y: event.offsetY };
      this.selectTile(clickPos);

      dialog.showOpenDialog(options, async (paths: string[]) => {
        if (paths === undefined) return;

        const imgPath = paths[0];
        const rawImg = await this.spriteService.loadImage(imgPath);
        const img = await this.spriteService.HTMLImageToBitmap(rawImg);
        this.tilesetService.replaceSingleTile(img, clickPos);
      });
    });
  }

  /**
   * Calls SpriteService's reset function on AssetType.Terrain to reset the map's tileset to the default tileset
   * Fires a tilesUpdated event from mapService so the map knows to redraw itself
   * Calls tilesetLoad() to redraw the tileset tab's canvas
   */
  public async resetToDefaultTileset() {
    await this.spriteService.reset(AssetType.Terrain);
    this.mapService.tilesUpdated.next({ y: 0, x: 0, height: this.mapService.height, width: this.mapService.width });
    this.tilesetService.tilesetLoad();
  }

  /**
   * On pressing 'save' in the tileset tab:
   * Creates a clone canvas that is scaled down to the required size
   * Updates the sprite mapping in SpriteService with the new image
   */
  private async saveTileset() {
    const newCanvas = document.createElement('canvas');
    const context = newCanvas.getContext('2d');
    newCanvas.width = this.tilesetCanvas.width / this.tilesetService.MULTIPLIER;
    newCanvas.height = this.tilesetCanvas.height / this.tilesetService.MULTIPLIER;
    context.scale(1 / this.tilesetService.MULTIPLIER, 1 / this.tilesetService.MULTIPLIER);
    context.drawImage(this.tilesetCanvas, 0, 0);

    const tilesetImgBitmap = await createImageBitmap(newCanvas);
    this.spriteService.get(AssetType.Terrain).setCustomImage(tilesetImgBitmap);
  }

  /**
   * Generates a white border box around the tile that the user clicked to replace
   * @param clickPos A Coordinate that contains the x and y click positions relative to the canvas
   */
  private selectTile(clickPos: Coordinate) {
    const tileIndex = Math.floor(clickPos.y / (this.tilesetService.TILE_SIZE * this.tilesetService.MULTIPLIER));
    const nd = document.getElementById('tilesBox');
    nd.style.pointerEvents = 'none';
    nd.style.position = 'absolute';
    nd.style.border = 'white solid 1px';
    nd.style.top = (tileIndex * this.tilesetService.TILE_SIZE * this.tilesetService.MULTIPLIER) + 'px';
    nd.style.height = (this.tilesetService.TILE_SIZE * this.tilesetService.MULTIPLIER) + 'px';
    nd.style.width = (this.tilesetService.TILE_SIZE * this.tilesetService.MULTIPLIER) + 'px';
  }

  /**
   * On changing the 'magnification factor', the tileset must be redrawn using the updated multiplier
   * @param newValue The new value selected from the 'magnification factor' drop-down menu
   */
  private updateMultiplier(newValue) {
    this.tilesetService.MULTIPLIER = newValue;
    this.tilesetService.tilesetLoad();
  }
}
