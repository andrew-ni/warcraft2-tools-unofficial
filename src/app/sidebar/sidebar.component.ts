import { Component, OnInit } from '@angular/core';
import { MapService } from 'services/map.service';


interface CursorButton {
  name: string;
  imgSrc: string;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  constructor(
    private mapService: MapService,
  ) { }

  /**
   * Updates mapService based on user input
   * @param newValue the new map name
   */
  onChangeName(newValue) {
    this.mapService.name = newValue;
    console.log('map name is:', this.mapService.name);
  }

  /**
 * Updates mapService based on user input
 * @param newValue the new value that the user input into the gold amount text box
 */
  onChangeGold(newValue) {
    if (newValue === null) {  // have to use null here
      this.mapService.players[0].gold = 0;
    } else {
      this.mapService.players[0].gold = Math.abs(Math.round(newValue)); // hopefully someone can find a better way to do this. Would love to be able to restrict keypresses to 0-9 and backspace only, but the methods i've tried don't work
    }
    console.log('gold value of selected player: 0 is:', this.mapService.players[0].gold);
  }

  /**
  * Updates mapService based on user input
  * @param newValue the new value that the user input into the lumber amount text box
  */
  onChangeLumber(newValue) {
    if (newValue === null) {
      this.mapService.players[0].lumber = 0;
    } else {
      this.mapService.players[0].lumber = Math.abs(Math.round(newValue));
    }
    console.log('lumber value of selected player: 0 is:', this.mapService.players[0].lumber);
  }

  ngOnInit() {
  }
}
