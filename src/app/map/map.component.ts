import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { Observer, Subscription } from 'rxjs/Rx';

import { MapService } from 'services/map.service';
import { Dimension } from 'map';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, OnDestroy {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;

  onMapLoaded: Observer<Dimension> = {
    next: dim => {
      this.canvas.width = dim.width * 32;
      this.canvas.height = dim.height * 32;
      console.log('Canvas Resized', dim.width, dim.height);
    },
    error: error => console.error(error),
    complete: null
  };

  mapLoadedSubscription: Subscription;

  constructor(
    private mapService: MapService,
  ) {
  }

  ngOnInit() {
    this.canvas = document.getElementById('myCanvas') as HTMLCanvasElement;
    this.context = this.canvas.getContext('2d');

    // Draw canvas for the first time.
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    this.mapLoadedSubscription = this.mapService.subscribeToMapLoaded(this.onMapLoaded);

    // Pass canvas to map service for drawing
    this.mapService.setCanvas(this.canvas, this.context);
  }

  ngOnDestroy() {
    this.mapLoadedSubscription.unsubscribe();
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

