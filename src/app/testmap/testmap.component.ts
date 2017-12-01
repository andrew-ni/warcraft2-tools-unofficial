import { Component, OnInit } from '@angular/core';
import { Coordinate } from 'interfaces';
import { TestmapService } from 'services/testmap.service';

@Component({
  selector: 'app-testmap',
  templateUrl: './testmap.component.html',
  styleUrls: ['./testmap.component.scss']
})
export class TestmapComponent implements OnInit {
  private bottomCanvas: HTMLCanvasElement;
  private bottomContext: CanvasRenderingContext2D;

  private topCanvas: HTMLCanvasElement;
  private topContext: CanvasRenderingContext2D;

  private playerCanvas: HTMLCanvasElement;
  private playerContext: CanvasRenderingContext2D;

  constructor(
    private testmapService: TestmapService,
  ) { }

  ngOnInit() {
    this.bottomCanvas = document.getElementById('bottomCanvas') as HTMLCanvasElement;
    this.bottomContext = this.bottomCanvas.getContext('2d');
    this.topCanvas = document.getElementById('topCanvas') as HTMLCanvasElement;
    this.topContext = this.topCanvas.getContext('2d');
    this.playerCanvas = document.getElementById('playerCanvas') as HTMLCanvasElement;
    this.playerContext = this.topCanvas.getContext('2d');
    this.topCanvas.width = 512;
    this.topCanvas.height = 512;
    this.bottomCanvas.width = 512;
    this.bottomCanvas.height = 512;
    this.playerCanvas.width = 512;
    this.playerCanvas.height = 512;

    this.setClickListeners();
    this.testmapService.setCanvases(this.bottomCanvas, this.bottomContext, this.topCanvas, this.topContext, this.playerCanvas, this.playerContext);
  }

  private setClickListeners() {
    // const x = Math.floor(event.offsetX / CanvasService.TERRAIN_SIZE);
    // const y = Math.floor(event.offsetY / CanvasService.TERRAIN_SIZE);

    /**
     * On mousedown, being pathfinding calculations
     * https://developer.mozilla.org/en-US/docs/Web/Events/mousedown; 0=leftclick, 1=middleclick, 2=rightclick
     */
    this.playerCanvas.addEventListener('mousedown', (event) => {
      if (event.button === 0) {
        this.testmapService.pathfind({ x: event.offsetX, y: event.offsetY });
      }
    });
  }
}
