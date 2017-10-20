import { Component, OnInit } from '@angular/core';
import { MapService } from 'services/map.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
  constructor(
    private mapService: MapService,
  ) {
  }

  ngOnInit() {
    const canvas: HTMLCanvasElement = document.getElementById('myCanvas') as HTMLCanvasElement;
    const context: CanvasRenderingContext2D = canvas.getContext('2d');

    // Start listening to resize events and
    // draw canvas.
    initialize();

    function initialize() {
      // Calls resizeCanvas() on window resize
      window.addEventListener('resize', resizeCanvas, false);

      // Draw canvas border for the first time.
      resizeCanvas();
    }

    function redraw() {
      context.strokeStyle = 'blue';
      context.lineWidth = 5;
      context.strokeRect(0, 0, window.innerWidth, window.innerHeight);
    }

    // Runs each time the DOM window resize event fires.
    // Resets the canvas dimensions to match window,
    // then draws the new borders accordingly.
    function resizeCanvas() {
      console.log('resize requested');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      redraw();
    }

    // Pass canvas to map service for drawing
    this.mapService.setCanvas(canvas, context);
  }
}

