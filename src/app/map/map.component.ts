import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { Observer, Subscription } from 'rxjs/Rx';

import { MapService } from 'services/map.service';
import { Dimension, Coordinate } from 'interfaces';
import { CanvasService } from 'services/canvas.service';
import { MapObject } from 'map';
import { UserService } from 'services/user.service';
import { TerrainService } from 'services/terrain.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, OnDestroy {

  private map: MapObject;
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;



  mapLoadedSubscription: Subscription;

  constructor(
    private mapService: MapService,
    private canvasService: CanvasService,
    private userService: UserService,
    private terrainService: TerrainService,
  ) {
  }

  ngOnInit() {
    this.map = this.mapService.map;
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
      if (this.map !== undefined) {
        const x = Math.floor(event.offsetX / CanvasService.TERRAIN_SIZE);
        const y = Math.floor(event.offsetY / CanvasService.TERRAIN_SIZE);
        this.userService.applySelectedType(
          (tileType) => this.terrainService.updateTiles(tileType, { y, x, width: 1, height: 1 }),
          (assetType) => { this.map.placeAsset(1, assetType, x, y, false); this.canvasService.drawAssets(); },
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

  // // Runs each time the DOM window resize event fires.
  // // Resets the canvas dimensions to match window,
  // // then draws the new borders accordingly.
  // @HostListener('window:resize', ['$event'])
  // private resizeCanvas() {
  //   console.log('resize requested');
  //   this.canvas.width = window.innerWidth;
  //   this.canvas.height = window.innerHeight;
  // }
}

