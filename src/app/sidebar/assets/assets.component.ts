import { Component, OnInit } from '@angular/core';
import { MapService } from 'services/map.service';
import { UserService } from 'services/user.service';

@Component({
  selector: 'app-assets',
  templateUrl: './assets.component.html',
  styleUrls: ['./assets.component.scss']
})
export class AssetsComponent implements OnInit {

  /** selectPlayer is the currently selected player. This seems redundant, but is necessary for displaying the current player (1) on app startup */
  selectPlayer = 1;

  constructor(private mapService: MapService, private userService: UserService) {
  }

  ngOnInit() {
  }

   /**
    * This helper function mimics python's range() function
    * @param start Number to start at
    * @param edge Number to end at
    * @param step step size
    * @returns an array of numbers counting up
    */
  range(start: number, edge?: number, step?: number) {
    if (arguments.length === 1) {
      edge = start;
      start = 0;
    }

    edge = edge || 0;
    step = step || 1;

    const ret = [];
    for (; (edge - start) * step > 0; start += step) {
      ret.push(start);
    }
    return ret;
  }

  /**
   * Updates userService based on user input
   * @param newValue the new value that the user selected from the select player drop down menu
   */
  onChangeSelectPlayer(newValue) {
    this.selectPlayer = newValue;
    this.userService.selectedPlayer = this.selectPlayer;
    console.log('selected player is:', this.userService.selectedPlayer);
  }

  /**
   * Updates mapService based on user input
   * @param newValue the new value that the user input into the gold amount text box
   */
  onChangeGold(newValue) {
    this.mapService.players[this.selectPlayer].gold = newValue;
    console.log('gold value of selected player:', this.userService.selectedPlayer, 'is:', this.mapService.players[this.selectPlayer].gold);
  }

  /**
  * Updates mapService based on user input
  * @param newValue the new value that the user input into the lumber amount text box
  */
  onChangeLumber(newValue) {
    this.mapService.players[this.selectPlayer].lumber = newValue;
    console.log(this.mapService.players[this.selectPlayer].lumber);
  }
}
