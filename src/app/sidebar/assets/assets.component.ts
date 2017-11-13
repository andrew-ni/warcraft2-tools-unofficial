import { Component, OnInit } from '@angular/core';
import { UserService } from 'services/user.service';
import { MapService } from 'services/map.service';

@Component({
  selector: 'app-assets',
  templateUrl: './assets.component.html',
  styleUrls: ['./assets.component.scss']
})
export class AssetsComponent implements OnInit {
  PlayerNumber = [];
  SelectPlayer = 1;
  GoldAmount;
  LumberAmount;
  constructor(private mapService: MapService, private userService: UserService) { 
    this.mapService.mapLoaded.do(() => console.log('map:loaded')).subscribe({
      next: () => this.setProperties(),
      error: err => console.error(err),
    });
  }

  onChangeSelectPlayer(newValue) {
    console.log(newValue);
    this.userService.selectedPlayer = this.SelectPlayer;
    this.GoldAmount = this.mapService.players[this.SelectPlayer].gold;
    this.LumberAmount = this.mapService.players[this.SelectPlayer].lumber;
    switch(this.mapService.players.length-1) {
      case 2:
        this.PlayerNumber = [1, 2];
        break;
      case 3:
        this.PlayerNumber = [1, 2, 3];
        break;
      case 4:
        this.PlayerNumber = [1, 2, 3, 4];
        break;
      case 5:
        this.PlayerNumber = [1, 2, 3, 4, 5];
        break;
      case 6:
        this.PlayerNumber = [1, 2, 3, 4, 5, 6];
        break;
      case 7:
        this.PlayerNumber = [1, 2, 3, 4, 5, 6, 7];
        break;
      case 8:
        this.PlayerNumber = [1, 2, 3, 4, 5, 6, 7, 8];
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
    switch(this.mapService.players.length-1) {
      case 2:
        this.PlayerNumber = [1, 2];
        break;
      case 3:
        this.PlayerNumber = [1, 2, 3];
        break;
      case 4:
        this.PlayerNumber = [1, 2, 3, 4];
        break;
      case 5:
        this.PlayerNumber = [1, 2, 3, 4, 5];
        break;
      case 6:
        this.PlayerNumber = [1, 2, 3, 4, 5, 6];
        break;
      case 7:
        this.PlayerNumber = [1, 2, 3, 4, 5, 6, 7];
        break;
      case 8:
        this.PlayerNumber = [1, 2, 3, 4, 5, 6, 7, 8];
        break;
      default:
        console.error();
        break;
      }
  }

  ngOnInit() {
    
  }

}
