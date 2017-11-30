import { Component, Input, OnInit } from '@angular/core';
import { MapDisplay } from '../web.component';

@Component({
  selector: 'app-map-display',
  templateUrl: './map-display.component.html',
  styleUrls: ['./map-display.component.scss']
})
export class MapDisplayComponent implements OnInit {
  @Input() private mapData: MapDisplay;
  constructor() { }

  ngOnInit() {
  }

}
