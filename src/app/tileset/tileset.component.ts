import { Component, OnInit } from '@angular/core';

import { Coordinate } from 'interfaces';
import { CanvasService } from 'services/canvas.service';
import { TilesetService } from 'services/tileset.service';

@Component({
  selector: 'app-tileset',
  templateUrl: './tileset.component.html',
  styleUrls: ['./tileset.component.scss']
})
export class TilesetComponent implements OnInit {

  private eventHandler: HTMLDivElement;

  private tilesetCanvas: HTMLCanvasElement;
  private tilesetContext: CanvasRenderingContext2D;

  constructor(
    private tilesetService: TilesetService,
  ) { }

  ngOnInit() {
    this.eventHandler = document.getElementById('tilesetevents') as HTMLDivElement;
    this.tilesetCanvas = document.getElementById('tilesetCanvas') as HTMLCanvasElement;
    this.tilesetContext = this.tilesetCanvas.getContext('2d');
    this.tilesetService.setCanvas(this.tilesetCanvas, this.tilesetContext);
    this.setClickListeners();

  }

  private setClickListeners() {

    let clickPos: Coordinate;
    this.eventHandler.addEventListener('click', (event) => {
      clickPos = { x: event.offsetX, y: event.offsetY };
      console.log(Math.floor(clickPos.y / (CanvasService.TERRAIN_SIZE * this.tilesetService.MULTIPLIER)));
      this.selectTile(clickPos);
    });
  }

  private selectTile(clickPos: Coordinate) {
    const tileIndex = Math.floor(clickPos.y / (CanvasService.TERRAIN_SIZE * this.tilesetService.MULTIPLIER));
    const nd = document.getElementById('tilesBox');
    nd.style.pointerEvents = 'none';
    nd.style.position = 'absolute';
    nd.style.border = 'white solid 1px';
    nd.style.top = (tileIndex * CanvasService.TERRAIN_SIZE * this.tilesetService.MULTIPLIER) + 'px';
    nd.style.height = (CanvasService.TERRAIN_SIZE * this.tilesetService.MULTIPLIER) + 'px';
    nd.style.width = (CanvasService.TERRAIN_SIZE * this.tilesetService.MULTIPLIER) + 'px';
  }

}
