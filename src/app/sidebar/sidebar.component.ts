import { Component, OnInit } from '@angular/core';

import { Player } from 'player';
import { MapService } from 'services/map.service';
import { UserService } from 'services/user.service';
import { log } from 'util';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  playerCount = [2, 3, 4, 5, 6, 7, 8];

  constructor(private mapService: MapService, private userService: UserService) {
  }

  ngOnInit() {
  }

  onChangeName(newValue) {
    this.mapService.name = newValue;
    console.log('map name is:', this.mapService.name);
  }

  onChangeNumPlayers(newValue) {
    if (newValue > this.mapService.players.length - 1) {
      for (let i = this.mapService.players.length; i <= newValue; i++) {
        this.mapService.players.push(new Player(i, 2000, 150));
      }
      console.log('number of human players is now:', this.mapService.players.length - 1);
    } else if (newValue < this.mapService.players.length - 1) {
      for (let i = this.mapService.players.length; i > newValue; i--) {
        this.mapService.players.pop();
      }
      console.log('number of human players is now:', this.mapService.players.length - 1);
      this.userService.selectedPlayer = this.mapService.players.length - 1;
    }
  }
}
