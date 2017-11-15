import { Component, OnInit } from '@angular/core';
import { Player } from 'player';
import { MapService } from 'services/map.service';
import { UserService } from 'services/user.service';

@Component({
  selector: 'app-assets',
  templateUrl: './assets.component.html',
  styleUrls: ['./assets.component.scss']
})
export class AssetsComponent implements OnInit {

  /** all the legal number of players the game is allowed to have */
  readonly PLAYER_NUM_OPTIONS = [2, 3, 4, 5, 6, 7, 8];

  constructor(private mapService: MapService, private userService: UserService) {
  }

  /**
   * Updates mapService and userService based on user input
   * @param newValue the new number of players we would like this map to have
   */
  onChangeNumPlayers(newValue) {
    if (newValue > this.mapService.players.length - 1) {
      for (let i = this.mapService.players.length; i <= newValue; i++) {
        this.mapService.players.push(new Player(i, 2000, 150));
      }
      console.log('number of human players is now:', this.mapService.players.length - 1);
    } else if (newValue < this.mapService.players.length - 1) {
      for (let i = this.mapService.players.length - 1; i > newValue; i--) {
        this.mapService.players.pop();
      }
      console.log('number of human players is now:', this.mapService.players.length - 1);
      this.userService.selectedPlayer = this.mapService.players.length - 1;
    }
  }

  /**
   * Updates userService based on user input
   * @param newValue the new value that the user selected from the select player drop down menu
   */
  onChangeSelectPlayer(newValue) {
    this.userService.selectedPlayer = newValue;
    console.log('selected player is:', this.userService.selectedPlayer);
  }

  /**
   * Updates mapService based on user input
   * @param newValue the new value that the user input into the gold amount text box
   */
  onChangeGold(newValue) {
    if (newValue === null) {  // have to use null here
      this.mapService.players[this.userService.selectedPlayer].gold = 0;
    } else {
      this.mapService.players[this.userService.selectedPlayer].gold = newValue;
    }
    console.log('gold value of selected player:', this.userService.selectedPlayer, 'is:', this.mapService.players[this.userService.selectedPlayer].gold);
  }

  /**
  * Updates mapService based on user input
  * @param newValue the new value that the user input into the lumber amount text box
  */
  onChangeLumber(newValue) {
    if (newValue === null) {
      this.mapService.players[this.userService.selectedPlayer].lumber = 0;
    } else {
      this.mapService.players[this.userService.selectedPlayer].lumber = newValue;
    }
    console.log(this.mapService.players[this.userService.selectedPlayer].lumber);
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

  ngOnInit() {
  }
}
