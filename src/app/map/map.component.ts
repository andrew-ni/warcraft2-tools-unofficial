import { Component, OnInit, HostListener } from '@angular/core';
import { MapService } from 'services/map.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;

  constructor(
    private mapService: MapService,
  ) {
  }

  ngOnInit() {
    this.canvas = document.getElementById('myCanvas') as HTMLCanvasElement;
    this.context = this.canvas.getContext('2d');

    // Draw canvas for the first time.
    this.resizeCanvas();

    // Pass canvas to map service for drawing
    this.mapService.setCanvas(this.canvas, this.context);
  }

  // Runs each time the DOM window resize event fires.
  // Resets the canvas dimensions to match window,
  // then draws the new borders accordingly.
  @HostListener('window:resize', ['$event'])
  private resizeCanvas() {
    console.log('resize requested');
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.redraw();
  }

  private redraw() {
    this.context.strokeStyle = 'blue';
    this.context.lineWidth = 5;
    this.context.strokeRect(0, 0, window.innerWidth, window.innerHeight);
  }
}

