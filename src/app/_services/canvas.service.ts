import { Injectable } from '@angular/core';
import { AssetType } from 'asset';
import { readdir } from 'fs';
import { Coordinate, Region } from 'interfaces';
import { MapService } from 'services/map.service';
import { MapObject } from 'map';
import { UserService } from 'services/user.service';
import { TerrainService } from 'services/terrain.service';
import { AssetsService } from 'services/assets.service';


@Injectable()
export class CanvasService {
  private readonly TERRAIN_SIZE = 32; // size of a single terrain tile, in pixels
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private assetMap = new Map<AssetType, HTMLImageElement>();
  private fs;
  private path;

  private map: MapObject;

  constructor(
    private mapService: MapService,
    private userService: UserService,
    private terrainService: TerrainService,
    private assetService: AssetsService,
  ) {
    this.map = mapService.map;
    // Load assets before, and independently of map:loaded.
    this.fs = require('fs');
    this.path = require('path');
  }

  // Save canvas context from map.component.ts
  public setCanvas(c: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void {
    this.canvas = c;
    this.context = ctx;
    this.setClickListeners();
  }

  // Handles clickEvents like clickdrag and panning.
  private setClickListeners() {
    let clickPos: Coordinate;

    const placeMapElementAtCursor = (event: MouseEvent) => {
      if (this.map !== undefined) {
        const x = Math.floor(event.offsetX / this.TERRAIN_SIZE);
        const y = Math.floor(event.offsetY / this.TERRAIN_SIZE);
        this.userService.applySelectedType(
          (tileType) => this.terrainService.updateTiles(tileType, { y, x, width: 1, height: 1 }),
          (assetType) => { this.map.placeAsset(1, assetType, x, y, false); this.assetService.drawAssets(); },
        );
      }
    };

    // https://stackoverflow.com/a/34030504
    const pan = (event: MouseEvent) => {
      if (this.map !== undefined) {
        document.body.style.cursor = 'move';
        this.canvas.parentElement.scrollLeft += clickPos.x - event.offsetX;
        this.canvas.parentElement.scrollTop += clickPos.y - event.offsetY;
      }
    };

    // Helper function to remove mousemove listeners. Called on mouseup or mouseleave.
    const removeListeners = () => {
      document.body.style.cursor = 'auto';
      this.canvas.removeEventListener('mousemove', placeMapElementAtCursor, false);
      this.canvas.removeEventListener('mousemove', pan, false);
    };

    // On mousedown, route to appropriate function (clickdrag or pan)
    // https://developer.mozilla.org/en-US/docs/Web/Events/mousedown
    // 0 = left click, 1 = middle click, 2 = right click
    this.canvas.addEventListener('mousedown', (event) => {
      clickPos = { x: event.offsetX, y: event.offsetY };
      this.canvas.addEventListener('mouseleave', removeListeners, false); // cancels current action if mouse leaves canvas
      if (event.button === 0) { placeMapElementAtCursor(event); this.canvas.addEventListener('mousemove', placeMapElementAtCursor, false); }
      if (event.button === 2) { this.canvas.addEventListener('mousemove', pan, false); }
    });

    // On mouseup, remove listeners
    this.canvas.addEventListener('mouseup', (event) => {
      removeListeners();
      this.canvas.removeEventListener('mouseleave', function () { }, false);
    });
  }


  // Draws Map when loaded from file.
  public drawMap(reg: Region = { x: 0, y: 0, width: this.map.width, height: this.map.height }): void {
    if (reg.y < 0) reg.y = 0;
    if (reg.x < 0) reg.x = 0;
    if (reg.y + reg.height > this.map.height) reg.height = this.map.height - reg.y;
    if (reg.x + reg.width > this.map.width) reg.width = this.map.width - reg.x;
    const terrain = this.assetMap.get(AssetType.Terrain);
    for (let x = reg.x; x < reg.x + reg.width; x++) {
      for (let y = reg.y; y < reg.y + reg.width; y++) {
        this.drawImage(terrain, terrain.width, y, x, this.map.drawLayer[y][x].index);
      }
    }
  }

  // Draws Assets layer using Assets[] array from map.ts
  public drawAssets(yStart: number = 0, xStart: number = 0, height: number = this.map.height, width: number = this.map.width): void {
    for (const asset of this.map.assets) {
      const img = this.assetMap.get(asset.assetType);
      this.drawImage(img, img.width, asset.y, asset.x, 0);
    }
  }

  // PARMS: image (assetMap.get(imgName), width (use image.width), y, x (in 32x32 pixels), index (position on spritesheet)
  private drawImage(image: HTMLImageElement, width: number, y: number, x: number, index: number): void {
    this.context.drawImage(image, 0, index * width, width, width, x * this.TERRAIN_SIZE, y * this.TERRAIN_SIZE, width, width);
  }
}
