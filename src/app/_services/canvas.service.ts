import { Injectable } from '@angular/core';
import { AssetType } from 'asset';
import { readdir } from 'fs';
import { Coordinate } from 'interfaces';
import { MapService } from 'services/map.service';
import { MapObject } from 'map';


@Injectable()
export class CanvasService {
  private readonly TERRAIN_SIZE = 32; // size of a single terrain tile, in pixels
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private assetMap = new Map<AssetType, HTMLImageElement>();
  private fs;
  private path;

  private map: MapObject;

  constructor(private mapService: MapService) {
    this.map = mapService.map;
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
          (tileType) => this.map.updateTiles(tileType, { y, x, width: 1, height: 1 }),
          (assetType) => { this.map.placeAsset(1, assetType, x, y, false); this.drawAssets(); },
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
}
