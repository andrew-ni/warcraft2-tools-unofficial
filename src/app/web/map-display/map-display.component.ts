import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MapDisplay } from '../web.component';

@Component({
  selector: 'app-map-display',
  templateUrl: './map-display.component.html',
  styleUrls: ['./map-display.component.scss']
})
export class MapDisplayComponent implements OnInit {
  @Input() private mapData: MapDisplay;
  @Output() imported = new EventEmitter<string>();

  constructor() { }

  ngOnInit() {
  }

}
