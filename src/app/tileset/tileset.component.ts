import { Component, OnInit } from '@angular/core';
import { Menu } from 'electron';
import { saveAs } from 'file-saver';

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

@Component({
  selector: 'app-tileset',
  templateUrl: './tileset.component.html',
  styleUrls: ['./tileset.component.scss']
})
export class TilesetComponent implements OnInit {

  private tilesetCanvas: HTMLCanvasElement;
  private tilesetContext: CanvasRenderingContext2D;

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

  private setClickListeners() {
    let clickPos: Coordinate;
    this.tilesetCanvas.addEventListener('click', (event) => {
      clickPos = { x: event.offsetX, y: event.offsetY };
      this.selectTile(clickPos);

      // TODO:
      // scale png to 32x32
      // save to Terrain.png
      dialog.showOpenDialog(options, async (paths: string[]) => {
        if (paths === undefined) return;

        const imgPath = paths[0];
        const rawImg = await this.spriteService.loadImage(imgPath);
        const img = await this.spriteService.HTMLImageToBitmap(rawImg);
        this.tilesetService.replaceSingleTile(img, clickPos);
        this.saveTileset();
        await this.spriteService.prefetch(AssetType.Terrain);
        this.mapService.tilesUpdated.next({y: 0, x: 0, height: this.mapService.height, width: this.mapService.width });
      });
    });
  }

  private saveTileset() {
    this.tilesetCanvas.toBlob((blob) => {
      saveAs(blob, 'Terrain.png');
    });
  }

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
}
