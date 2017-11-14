import { Component, OnInit } from '@angular/core';
import { MapService } from 'services/map.service';
import { UserService } from 'services/user.service';

@Component({
  selector: 'app-assets',
  templateUrl: './assets.component.html',
  styleUrls: ['./assets.component.scss']
})
export class AssetsComponent implements OnInit {
  PlayerCount = [];
  SelectPlayer = 1;
  GoldAmount;
  LumberAmount;

  constructor(private mapService: MapService, private userService: UserService) {
  }

  ngOnInit() {
    this.mapService.mapLoaded.do(() => console.log('mapLoaded:assetsSidebar')).subscribe({
      next: () => this.setProperties(),
      error: err => console.error(err),
    });
   }

  onChangeSelectPlayer(newValue) {
    console.log(newValue);
    this.userService.selectedPlayer = this.SelectPlayer;
    this.GoldAmount = this.mapService.players[this.SelectPlayer].gold;
    this.LumberAmount = this.mapService.players[this.SelectPlayer].lumber;

    switch (this.mapService.players.length - 1) {
      case 2:
        this.PlayerCount = [1, 2];
        break;
      case 3:
        this.PlayerCount = [1, 2, 3];
        break;
      case 4:
        this.PlayerCount = [1, 2, 3, 4];
        break;
      case 5:
        this.PlayerCount = [1, 2, 3, 4, 5];
        break;
      case 6:
        this.PlayerCount = [1, 2, 3, 4, 5, 6];
        break;
      case 7:
        this.PlayerCount = [1, 2, 3, 4, 5, 6, 7];
        break;
      case 8:
        this.PlayerCount = [1, 2, 3, 4, 5, 6, 7, 8];
        break;
      default:
        console.error();
        break;
      }
    // ... do other stuff here ...
  }

  onChangeGold(newValue) {
    console.log(newValue);
    this.mapService.players[this.SelectPlayer].gold = this.GoldAmount;
    // ... do other stuff here ...
  }

  onChangeLumber(newValue) {
    console.log(newValue);
    this.mapService.players[this.SelectPlayer].lumber = this.LumberAmount;
    // ... do other stuff here ...
  }

  public setProperties() {
    this.GoldAmount = this.mapService.players[this.SelectPlayer].gold;
    this.LumberAmount = this.mapService.players[this.SelectPlayer].lumber;
    switch (this.mapService.players.length - 1) {
      case 2:
        this.PlayerCount = [1, 2];
        break;
      case 3:
        this.PlayerCount = [1, 2, 3];
        break;
      case 4:
        this.PlayerCount = [1, 2, 3, 4];
        break;
      case 5:
        this.PlayerCount = [1, 2, 3, 4, 5];
        break;
      case 6:
        this.PlayerCount = [1, 2, 3, 4, 5, 6];
        break;
      case 7:
        this.PlayerCount = [1, 2, 3, 4, 5, 6, 7];
        break;
      case 8:
        this.PlayerCount = [1, 2, 3, 4, 5, 6, 7, 8];
        break;
      default:
        console.error();
        break;
      }
  }
}
