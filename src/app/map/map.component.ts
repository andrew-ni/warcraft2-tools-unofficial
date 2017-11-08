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

  private eventHandler: HTMLDivElement;

  private terrainCanvas: HTMLCanvasElement;
  private terrainContext: CanvasRenderingContext2D;

  private assetCanvas: HTMLCanvasElement;
  private assetContext: CanvasRenderingContext2D;

  mapLoadedSubscription: Subscription;

  constructor(
    private canvasService: CanvasService,
    private userService: UserService,
    private terrainService: TerrainService,
    private assetsService: AssetsService,
  ) { }

  /**
   * Draws canvas for the first time
   * Sets click listeners
   */
  ngOnInit() {
    this.eventHandler = document.getElementById('events') as HTMLDivElement;
    this.terrainCanvas = document.getElementById('terrainCanvas') as HTMLCanvasElement;
    this.terrainContext = this.terrainCanvas.getContext('2d');

    this.assetCanvas = document.getElementById('assetCanvas') as HTMLCanvasElement;
    this.assetContext = this.assetCanvas.getContext('2d');
    this.canvasService.setCanvases(this.terrainCanvas, this.terrainContext, this.assetCanvas, this.assetContext);

    // Pass canvas to map service for drawing
    this.setClickListeners();
  }

  ngOnDestroy() {
    this.mapLoadedSubscription.unsubscribe();
  }

  /**
   * Handles click events like clickdrag and panning
   */
  private setClickListeners() {
    let clickPos: Coordinate;

    // Regions sent on click are exactly 1x1. Subsequent functions should expand / modify this Region before drawing.
    const placeMapElementAtCursor = (event: MouseEvent) => {
      const x = Math.floor(event.offsetX / CanvasService.TERRAIN_SIZE);
      const y = Math.floor(event.offsetY / CanvasService.TERRAIN_SIZE);
      this.userService.applySelectedType(
        (tileType) => this.terrainService.updateTiles(tileType, { y, x, width: 1, height: 1 }),
        (assetType) => {
          this.assetsService.placeAsset(this.userService.selectedPlayer, assetType, { y: y, x: x });
        },
      );
    };

    // https://stackoverflow.com/a/34030504
    const pan = (event: MouseEvent) => {
      document.body.style.cursor = 'move';
      this.terrainCanvas.parentElement.parentElement.scrollLeft += clickPos.x - event.offsetX;
      this.terrainCanvas.parentElement.parentElement.scrollTop += clickPos.y - event.offsetY;
    };

    /**
     * Helper function to remove mousemove listeners
     * Called on mouseup or mouseleave
     */
    const removeListeners = () => {
      document.body.style.cursor = 'auto';
      this.eventHandler.removeEventListener('mousemove', placeMapElementAtCursor, false);
      this.eventHandler.removeEventListener('mousemove', pan, false);
    };

    /**
     * On mousedown, route to appropriate function (clickdrag or pan)
     * https://developer.mozilla.org/en-US/docs/Web/Events/mousedown; 0=leftclick, 1=middleclick, 2=rightclick
     */
    this.eventHandler.addEventListener('mousedown', (event) => {
      clickPos = { x: event.offsetX, y: event.offsetY };
      this.eventHandler.addEventListener('mouseleave', removeListeners, false); // cancels current action if mouse leaves canvas
      if (event.button === 0) { placeMapElementAtCursor(event); this.eventHandler.addEventListener('mousemove', placeMapElementAtCursor, false); }
      if (event.button === 2) { this.eventHandler.addEventListener('mousemove', pan, false); }
    });

    /** On mouseup, remove listeners */
    this.eventHandler.addEventListener('mouseup', (event) => {
      removeListeners();
      this.eventHandler.removeEventListener('mouseleave', function () { }, false);
    });
  }
}

