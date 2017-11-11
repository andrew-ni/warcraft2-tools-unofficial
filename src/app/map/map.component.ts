import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Rx';


import { Coordinate, Region } from 'interfaces';
import { AssetsService } from 'services/assets.service';
import { CanvasService } from 'services/canvas.service';
import { TerrainService } from 'services/terrain.service';
import { UserService } from 'services/user.service';


enum State {
  noSelection,
  terrainBrush,
  assetBrush,
  selectionTool,
}

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

  private beginMouse: Coordinate;
  private endMouse: Coordinate;

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
    this.beginMouse = { x: 0, y: 0 };
    this.endMouse = { x: 0, y: 0 };
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
        (assetType) => this.assetsService.placeAsset(this.userService.selectedPlayer, assetType, { x, y }),
      );
    };

    /**
     *
     * @param event
     */
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
     * Adds a listener to capture delete key presses and then deletes the appropriate selection
     * TODO: move this into a method for keyboard events only? remove the listener?
     */
    this.eventHandler.addEventListener('keydown', (event) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        for (const asset of this.userService.selectedAssets) {
          this.assetsService.removeAsset(asset);
        }
      }
    });


    /**
     * On mousedown, route to appropriate function (clickdrag or pan)
     * https://developer.mozilla.org/en-US/docs/Web/Events/mousedown; 0=leftclick, 1=middleclick, 2=rightclick
     */
    this.eventHandler.addEventListener('mousedown', (event) => {
      clickPos = { x: event.offsetX, y: event.offsetY };
      if (this.userService.state === State.selectionTool) {
        console.log(this.beginMouse.x + '  ' + this.beginMouse.y);
        this.beginMouse.x = Math.floor(event.offsetX / CanvasService.TERRAIN_SIZE);
        this.beginMouse.y = Math.floor(event.offsetY / CanvasService.TERRAIN_SIZE);
      } else {
        this.eventHandler.addEventListener('mouseleave', removeListeners, false); // cancels current action if mouse leaves canvas
        if (event.button === 0) { placeMapElementAtCursor(event); this.eventHandler.addEventListener('mousemove', placeMapElementAtCursor, false); }
        if (event.button === 2) { this.eventHandler.addEventListener('mousemove', pan, false); }
      }
    });

    /** On mouseup, remove listeners */
    this.eventHandler.addEventListener('mouseup', (event) => {
      if (this.userService.state === State.selectionTool) {
        this.endMouse.x = Math.floor(event.offsetX / CanvasService.TERRAIN_SIZE);
        this.endMouse.y = Math.floor(event.offsetY / CanvasService.TERRAIN_SIZE);
        const reg: Region = { x: Math.min(this.beginMouse.x, this.endMouse.x), y: Math.min(this.beginMouse.y, this.endMouse.y), height: Math.abs(this.endMouse.y - this.beginMouse.y), width: Math.abs(this.endMouse.x - this.beginMouse.x) };
        this.userService.selectedAssets = this.assetsService.selectAssets(reg);
        console.log(this.userService.selectedAssets);
        if (event.button === 2) { this.assetsService.removeInvalidAsset(reg, true); } // for testing purposes

      }
      removeListeners();
      this.eventHandler.removeEventListener('mouseleave', function() { }, false);
    });
  }
}

