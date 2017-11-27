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
  private saveCanvas; HTMLCanvasElement;
  private saveContext: CanvasRenderingContext2D;

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

      dialog.showOpenDialog(options, async (paths: string[]) => {
        if (paths === undefined) return;

        const imgPath = paths[0];
        const rawImg = await this.spriteService.loadImage(imgPath);
        const img = await this.spriteService.HTMLImageToBitmap(rawImg);
        this.tilesetService.replaceSingleTile(img, clickPos);
      });
    });
  }

  private saveTileset() {
    this.saveCanvas = document.createElement('canvas');
    this.saveContext = this.saveCanvas.getContext('2d');
    this.saveCanvas.width = this.tilesetCanvas.width / this.tilesetService.MULTIPLIER;
    this.saveCanvas.height = this.tilesetCanvas.height / this.tilesetService.MULTIPLIER;
    this.saveContext.drawImage(this.tilesetCanvas, 0, 0);

    this.saveCanvas.toBlob(async (blob) => {
      saveAs(blob, 'Terrain.png');
      await this.spriteService.prefetch(AssetType.Terrain);
      this.mapService.tilesUpdated.next({y: 0, x: 0, height: this.mapService.height, width: this.mapService.width });
    });
  }

  // private cloneCanvas(oldCanvas: HTMLCanvasElement) {
  //   const clone = document.createElement('canvas');
  //   const ctx = clone.getContext('2d');
  //   clone.width = oldCanvas.width / this.tilesetService.MULTIPLIER;
  //   clone.height = oldCanvas.height / this.tilesetService.MULTIPLIER;
  //   ctx.drawImage(oldCanvas, 0, 0);
  //   return clone;
  // }

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
