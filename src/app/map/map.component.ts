import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Rx';

import { Coordinate } from 'interfaces';
import { AssetsService } from 'services/assets.service';
import { CanvasService } from 'services/canvas.service';
import { TerrainService } from 'services/terrain.service';
import { UserService } from 'services/user.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, OnDestroy {

  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;

  mapLoadedSubscription: Subscription;

  constructor(
    private canvasService: CanvasService,
    private userService: UserService,
    private terrainService: TerrainService,
    private assetsService: AssetsService,
  ) { }

  ngOnInit() {
    this.canvas = document.getElementById('myCanvas') as HTMLCanvasElement;
    this.context = this.canvas.getContext('2d');

    // Draw canvas for the first time.
    // this.canvas.width = window.innerWidth;
    // this.canvas.height = window.innerHeight;

    // Pass canvas to map service for drawing
    this.canvasService.setCanvas(this.canvas, this.context);
    this.setClickListeners();
  }

  ngOnDestroy() {
    this.mapLoadedSubscription.unsubscribe();
  }

  // Handles clickEvents like clickdrag and panning.
  private setClickListeners() {
    let clickPos: Coordinate;

    const placeMapElementAtCursor = (event: MouseEvent) => {
      const x = Math.floor(event.offsetX / CanvasService.TERRAIN_SIZE);
      const y = Math.floor(event.offsetY / CanvasService.TERRAIN_SIZE);
      this.userService.applySelectedType(
        (tileType) => this.terrainService.updateTiles(tileType, { y, x, width: 1, height: 1 }),
        (assetType) => { this.assetsService.placeAsset(1, assetType, x, y, false); this.canvasService.drawAssets(); },
      );
    };

    // https://stackoverflow.com/a/34030504
    const pan = (event: MouseEvent) => {
      document.body.style.cursor = 'move';
      this.canvas.parentElement.scrollLeft += clickPos.x - event.offsetX;
      this.canvas.parentElement.scrollTop += clickPos.y - event.offsetY;
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
      this.canvas.removeEventListener('mouseleave', function() { }, false);
    });
  }
}

