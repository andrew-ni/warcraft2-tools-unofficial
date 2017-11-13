import { Component, OnInit } from '@angular/core';
import { UserService } from 'services/user.service';
import { MapService } from 'services/map.service';
import { Player } from 'player';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  MapName;
  NumPlayers = [2,3,4,5,6,7,8];
  NumberPlayers = 1;

  constructor(private mapService: MapService) { 
    this.mapService.mapLoaded.do(() => console.log('map:loaded')).subscribe({
      next: () => this.setProperties(),
      error: err => console.error(err),
    });
  }

  onChangeName(newValue) {
    console.log(newValue);
    this.mapService.name = this.MapName;
    // ... do other stuff here ...
  }

  onChangeNumberPlayers(newValue) {
    console.log(newValue);
    if (newValue > this.mapService.players.length - 1)
    {
      for (var i = this.mapService.players.length; i <= newValue; i++) {
        console.log(i);
        this.mapService.players.push(new Player(i, 2000, 150));
      }
    }
    // ... do other stuff here ...
  }

  public setProperties() {
    this.MapName = this.mapService.name;
    this.NumberPlayers = this.mapService.players.length - 1;
  }


  ngOnInit() {
  }
}
