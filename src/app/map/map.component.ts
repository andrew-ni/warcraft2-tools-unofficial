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
  ) { }

  ngOnInit() {
    (function() {
      // Obtain a reference to the canvas element
      // using its id.
      const c: HTMLCanvasElement = document.getElementById('myCanvas') as HTMLCanvasElement;

      // Obtain a graphics context on the
      // canvas element for drawing.
      const context: CanvasRenderingContext2D = c.getContext('2d');

      // Start listening to resize events and
      // draw canvas.
      initialize();

      function initialize() {
        // Register an event listener to
        // call the resizeCanvas() function each time
        // the window is resized.
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
        c.width = window.innerWidth;
        c.height = window.innerHeight;
        redraw();
      }

    })();
  }
}
