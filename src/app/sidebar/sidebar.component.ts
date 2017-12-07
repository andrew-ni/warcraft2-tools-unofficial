import { Component, OnInit } from '@angular/core';
import { AssetType } from 'asset';
import { MapService } from 'services/map.service';
import { UserService } from 'services/user.service';
import { TileType } from 'tile';


interface ToolButton {
  name: string;
  imgSrc: string;
  tileType: TileType;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  toolButtons: ToolButton[] = [
    {
      name: 'Cursor',
      imgSrc: './assets/frontend_icons/cursor_icon.png',
      tileType: 0,
    },
    {
      name: 'buttonSize1',
      imgSrc: './assets/frontend_icons/small_brush.png',
      tileType: 1,
    },
    {
      name: 'buttonSize3',
      imgSrc: './assets/frontend_icons/medium_brush.png',
      tileType: 3,
    },
    {
      name: 'buttonSize5',
      imgSrc: './assets/frontend_icons/large_brush.png',
      tileType: 5,
    },
  ];

  constructor(
    private mapService: MapService,
    private userService: UserService,
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

  onChangeTools(newValue, toolName: string, brushSize) {
    if (toolName === 'Cursor') {
      this.assetChange(this.userService.assetToBeDrawn, 1);
      this.userService.selectedAssets = [];
      console.log(this.userService.terrainToBeDrawn);
      document.getElementById('buttonSize' + this.userService.selectedBrush).setAttribute('style', 'opacity: 1');
      this.tileChange(this.userService.terrainToBeDrawn, 1);
    }
    else {
      this.assetChange(this.userService.assetToBeDrawn, 1);
      document.getElementById('Cursor').setAttribute('style', 'opacity: 1');
      document.getElementById('buttonSize' + this.userService.selectedBrush).setAttribute('style', 'opacity: 1');
      this.tileChange(this.userService.terrainToBeDrawn, 0.5);
      this.userService.selectedBrush = brushSize;
      this.userService.terrainToBeDrawn = this.userService.terrainToBeDrawn;
    }
    document.getElementById(toolName).setAttribute('style', 'opacity: 0.5');
  }

  tileChange(num, num2) {
    switch (num) {
      case 0:
        document.getElementById('Light Dirt').setAttribute('style', 'opacity: ' + num2);
        break;
      case 1:
        document.getElementById('Dark Dirt').setAttribute('style', 'opacity: ' + num2);
        break;
      case 2:
        document.getElementById('Forest').setAttribute('style', 'opacity: ' + num2);
        break;
      case 3:
        document.getElementById('Light Grass').setAttribute('style', 'opacity: ' + num2);
        break;
      case 4:
        document.getElementById('Dark Grass').setAttribute('style', 'opacity: ' + num2);
        break;
      case 5:
        document.getElementById('Shallow Water').setAttribute('style', 'opacity: ' + num2);
        break;
      case 6:
        document.getElementById('Deep Water').setAttribute('style', 'opacity: ' + num2);
        break;
      case 7:
        document.getElementById('Rock').setAttribute('style', 'opacity:  ' + num2);
        break;
    }
  }

  assetChange(num, num2) {
    switch (num) {
      case 0:
        document.getElementById('Archer').setAttribute('style', 'opacity: ' + num2);
        break;
      case 1:
        document.getElementById('Footman').setAttribute('style', 'opacity: ' + num2);
        break;
      case 2:
        document.getElementById('Peasant').setAttribute('style', 'opacity: ' + num2);
        break;
      case 3:
        document.getElementById('Ranger').setAttribute('style', 'opacity: ' + num2);
        break;
      case 4:
        document.getElementById('Barracks').setAttribute('style', 'opacity: ' + num2);
        break;
      case 5:
        document.getElementById('Blacksmith').setAttribute('style', 'opacity: ' + num2);
        break;
      case 6:
        document.getElementById('Farm').setAttribute('style', 'opacity: ' + num2);
        break;
      case 7:
        document.getElementById('CannonTower').setAttribute('style', 'opacity:  ' + num2);
        break;
      case 8:
        document.getElementById('Castle').setAttribute('style', 'opacity:  ' + num2);
        break;
      case 9:
        document.getElementById('GoldMine').setAttribute('style', 'opacity: ' + num2);
        break;
      case 10:
        document.getElementById('GuardTower').setAttribute('style', 'opacity: ' + num2);
        break;
      case 11:
        document.getElementById('Keep').setAttribute('style', 'opacity: ' + num2);
        break;
      case 12:
        document.getElementById('LumberMill').setAttribute('style', 'opacity: ' + num2);
        break;
      case 13:
        document.getElementById('ScoutTower').setAttribute('style', 'opacity: ' + num2);
        break;
      case 14:
        document.getElementById('TownHall').setAttribute('style', 'opacity: ' + num2);
        break;
    }
  }
  ngOnInit() {
  }
}
