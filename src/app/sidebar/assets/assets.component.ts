import { Component, OnInit } from '@angular/core';
import { AssetsService } from 'services/assets.service';
import { MapService } from 'services/map.service';
import { State, UserService } from 'services/user.service';


@Component({
  selector: 'app-assets',
  templateUrl: './assets.component.html',
  styleUrls: ['./assets.component.scss']
})
export class AssetsComponent implements OnInit {

  constructor(
    private userService: UserService,
    private assetsService: AssetsService,
    private mapService: MapService
  ) { }

  ngOnInit() {
  }

}
