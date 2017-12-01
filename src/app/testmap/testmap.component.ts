import { Component, OnInit } from '@angular/core';
import { Coordinate } from 'interfaces';
import { TestmapService } from 'services/testmap.service';

@Component({
  selector: 'app-testmap',
  templateUrl: './testmap.component.html',
  styleUrls: ['./testmap.component.scss']
})
export class TestmapComponent implements OnInit {
  private eventHandler: HTMLDivElement;

  private bottomCanvas: HTMLCanvasElement;
  private bottomContext: CanvasRenderingContext2D;

  private topCanvas: HTMLCanvasElement;
  private topContext: CanvasRenderingContext2D;

  constructor(
    private testmapService: TestmapService,
  ) { }

  ngOnInit() {
    this.eventHandler = document.getElementById('events') as HTMLDivElement;
    this.bottomCanvas = document.getElementById('bottomCanvas') as HTMLCanvasElement;
    this.bottomContext = this.bottomCanvas.getContext('2d');
    this.topCanvas = document.getElementById('topCanvas') as HTMLCanvasElement;
    this.topContext = this.topCanvas.getContext('2d');
    this.topCanvas.width = 512;
    this.topCanvas.height = 512;
    this.bottomCanvas.width = 512;
    this.bottomCanvas.height = 512;
    console.log(this.bottomCanvas.height);

    this.setClickListeners();
    this.testmapService.setCanvases(this.bottomCanvas, this.bottomContext, this.topCanvas, this.topContext);
  }

  private setClickListeners() {
    // let clickPos: Coordinate;

    // const x = Math.floor(event.offsetX / CanvasService.TERRAIN_SIZE);
    // const y = Math.floor(event.offsetY / CanvasService.TERRAIN_SIZE);

    /**
     * On mousedown, being pathfinding calculations
     * https://developer.mozilla.org/en-US/docs/Web/Events/mousedown; 0=leftclick, 1=middleclick, 2=rightclick
     */
    this.eventHandler.addEventListener('mousedown', (event) => {
      // clickPos = { x: event.offsetX, y: event.offsetY };
      if (event.button === 0) {
        this.pathfind({ x: event.offsetX, y: event.offsetY });
      }
    });
  }

  private pathfind(coord: Coordinate) {
    console.log(coord.x, coord.y);
  }

}
