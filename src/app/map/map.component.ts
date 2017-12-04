import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Rx';


import { ipcRenderer } from 'electron';
import { Coordinate, Region } from 'interfaces';
import { AssetsService } from 'services/assets.service';
import { CanvasService } from 'services/canvas.service';
import { MapService } from 'services/map.service';
import { TerrainService } from 'services/terrain.service';
import { State, UserService } from 'services/user.service';



@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {

  private eventHandler: HTMLDivElement;

  private isSelection = false;
  private selectionRegion: Region;

  private terrainCanvas: HTMLCanvasElement;
  private terrainContext: CanvasRenderingContext2D;

  private assetCanvas: HTMLCanvasElement;
  private assetContext: CanvasRenderingContext2D;

  // for selection tool
  private beginMouse: Coordinate;
  private endMouse: Coordinate;

  mapLoadedSubscription: Subscription;

  constructor(
    private canvasService: CanvasService,
    private userService: UserService,
    private terrainService: TerrainService,
    private assetsService: AssetsService,
    private mapService: MapService,
  ) {
    /**
    * Event listener for once the map is loaded. Clears any leftover selection boxes.
    */
    ipcRenderer.on('map:loaded', () => {
      document.getElementById('unitsBox').innerHTML = '';
    });
  }

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

    this.selectionRegion = { x: 0, y: 0, width: 0, height: 0 };
    // Pass canvas to map service for drawing
    this.setClickListeners();
    this.setKeyBoardListeners();
  }


  /**
   * Handles keyboard events like pressing delete to delete a group of assets
   */
  private setKeyBoardListeners() {

    /**
    * Adds a listener to capture delete key presses and then deletes the appropriate selection
    * TODO: remove the listener?
    */
    this.eventHandler.addEventListener('keydown', (event) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        for (const asset of this.userService.selectedAssets) {
          this.assetsService.removeAsset(asset);
        }
        document.getElementById('unitsBox').innerHTML = '';
      }
      this.userService.selectedAssets = [];
      this.userService.selectedRegions = [];
    });
  }

  /**
   * Draws a white box around each of the selected assets
  */
  private drawIndividualBoxes() {
    console.log(this.userService.selectedAssets);
    for (const asset of this.userService.selectedAssets) {
      const nd = document.createElement('div');
      document.getElementById('unitsBox').appendChild(nd);
      nd.style.pointerEvents = 'none';
      nd.style.position = 'absolute';
      nd.style.border = 'white solid 1px';
      nd.style.top = (asset.y * CanvasService.TERRAIN_SIZE) + 'px';
      nd.style.left = (asset.x * CanvasService.TERRAIN_SIZE) + 'px';
      nd.style.height = (asset.height * CanvasService.TERRAIN_SIZE) + 'px';
      nd.style.width = (asset.width * CanvasService.TERRAIN_SIZE) + 'px';
    }
  }

  /**
   * meant for single click selecting assets to be added to selectedAssets and selectedRegions
   * @param reg region to be scanned and added
   */
  private assetClicked(reg: Region) {
    if (this.mapService.assetLayer[reg.y][reg.x] !== undefined) {
      if (this.userService.selectedAssets.indexOf(this.mapService.assetLayer[reg.y][reg.x]) === -1) {
        const theAsset = this.mapService.assetLayer[reg.y][reg.x];
        reg = { x: reg.x, y: reg.y, width: theAsset.width, height: theAsset.height };
        this.userService.selectedAssets.push(theAsset);
        this.userService.selectedRegions.push(reg);
      }
    } else {
      this.userService.selectedAssets = this.assetsService.selectAssets(reg);
      this.userService.selectedRegions = [];
    }
  }

  /**
   *  meant for click dragging selecting assets to be added to selectedAsset and selectedRegions
   * @param reg region to be scanned and added
   */
  private assetDragged(reg: Region) {
    for (const asset of this.assetsService.selectAssets(reg)) {
      // check if it's not already in selectedAssets
      if (this.userService.selectedAssets.indexOf(asset) === -1) {
        this.userService.selectedAssets.push(asset);
      }
    }
    // add the region if there is an asset found
    if (this.userService.selectedAssets.length > 0) {
      this.userService.selectedRegions.push(reg);
    }

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
     * pan around the canvas
     */
    // https://stackoverflow.com/a/34030504
    const pan = (event: MouseEvent) => {
      document.body.style.cursor = 'move';
      this.terrainCanvas.parentElement.parentElement.scrollLeft += clickPos.x - event.offsetX;
      this.terrainCanvas.parentElement.parentElement.scrollTop += clickPos.y - event.offsetY;
    };

    /**
     *  draw the selection box by changing selection div
     */
    const drawBox = (event: MouseEvent) => {
      this.selectionRegion.x = Math.min(clickPos.x, event.offsetX);
      this.selectionRegion.y = Math.min(clickPos.y, event.offsetY);
      this.selectionRegion.width = Math.abs(event.offsetX - clickPos.x);
      this.selectionRegion.height = Math.abs(event.offsetY - clickPos.y);
      this.isSelection = true;
    };

    /**
     * Helper function to remove mousemove listeners
     * Called on mouseup or mouseleave
     */
    const removeListeners = () => {
      document.body.style.cursor = 'auto';
      this.eventHandler.removeEventListener('mousemove', placeMapElementAtCursor, false);
      this.eventHandler.removeEventListener('mousemove', pan, false);
      this.eventHandler.removeEventListener('mousemove', drawBox, false);
    };

    /**
     * On mousedown, route to appropriate function (clickdrag or pan, or begin selection)
     * https://developer.mozilla.org/en-US/docs/Web/Events/mousedown; 0=leftclick, 1=middleclick, 2=rightclick
     */
    this.eventHandler.addEventListener('mousedown', (event) => {
      clickPos = { x: event.offsetX, y: event.offsetY };
      // draw selection box if on that tool
      if (this.userService.state === State.selectionTool) {
        this.eventHandler.addEventListener('mouseleave', removeListeners, false); // cancels current action if mouse leaves canvas
        this.beginMouse.x = Math.floor(event.offsetX / CanvasService.TERRAIN_SIZE);
        this.beginMouse.y = Math.floor(event.offsetY / CanvasService.TERRAIN_SIZE);
        document.getElementById('unitsBox').innerHTML = '';
        this.eventHandler.addEventListener('mousemove', drawBox, false);
        // otherwise could be tile/asset draw
      } else {
        document.getElementById('unitsBox').innerHTML = '';
        // this.userService.selectedAssets = [];
        // this.userService.selectedRegions = [];
        this.eventHandler.addEventListener('mouseleave', removeListeners, false); // cancels current action if mouse leaves canvas
        if (event.button === 0) { placeMapElementAtCursor(event); this.eventHandler.addEventListener('mousemove', placeMapElementAtCursor, false); }
        if (event.button === 2) { this.eventHandler.addEventListener('mousemove', pan, false); }

      }
    });

    /** On mouseup, remove listeners */
    this.eventHandler.addEventListener('mouseup', (event) => {

      // calculate the selection are and draw the individual selection boxes
      if (this.userService.state === State.selectionTool) {
        this.endMouse.x = Math.floor(event.offsetX / CanvasService.TERRAIN_SIZE);
        this.endMouse.y = Math.floor(event.offsetY / CanvasService.TERRAIN_SIZE);
        const reg: Region = { x: Math.min(this.beginMouse.x, this.endMouse.x), y: Math.min(this.beginMouse.y, this.endMouse.y), height: Math.abs(this.endMouse.y - this.beginMouse.y), width: Math.abs(this.endMouse.x - this.beginMouse.x) };

        // if selection area is 0, then it was a click
        if (reg.width === 0 || reg.height === 0) {
          this.assetClicked(reg);
        } else {
          this.assetDragged(reg);
        }

        this.drawIndividualBoxes();
      }

      this.isSelection = false;
      removeListeners();
      // console.log('asset',this.userService.selectedAssets,'reg',this.userService.selectedRegions);
      this.eventHandler.removeEventListener('mouseleave', function() { }, false);
    });
  }
}
