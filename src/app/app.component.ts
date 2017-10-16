import { Component } from '@angular/core';
import { MapService } from 'services/map.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ECS160 Tools';

  constructor(
    mapService: MapService
  ) { }
}
