import { Component, OnInit } from '@angular/core';

import { Player } from 'player';
import { MapService } from 'services/map.service';
import { UserService } from 'services/user.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  playerCount = [2, 3, 4, 5, 6, 7, 8];

  constructor(private mapService: MapService, private appRef: ApplicationRef) {
  }

  ngOnInit() {
  }

  onChangeName(newValue) {
    console.log(newValue);
    this.mapService.name = newValue;
    // ... do other stuff here ...
  }

  onChangeNumPlayers(newValue) {
    console.log(newValue);
    if (newValue > this.mapService.players.length - 1) {
      for (let i = this.mapService.players.length; i <= newValue; i++) {
        console.log(i);
        this.mapService.players.push(new Player(i, 2000, 150));
      }
    } else if (newValue < this.mapService.players.length - 1) {
      for (let i = this.mapService.players.length; i >= newValue; i--) {
        console.log(i);
        this.mapService.players.pop();
      }
    }
  }
}
