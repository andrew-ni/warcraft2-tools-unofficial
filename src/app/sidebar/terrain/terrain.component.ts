import { Component, OnInit } from '@angular/core';
import { UserService } from 'services/user.service';
import { TileType } from 'tile';


interface TerrainButton {
  name: string;
  imgSrc: string;
  tileType: TileType;
}

@Component({
  selector: 'app-terrain',
  templateUrl: './terrain.component.html',
  styleUrls: ['./terrain.component.scss']
})
export class TerrainComponent implements OnInit {

  terrainButtons: TerrainButton[] = [
    {
      name: 'Light Grass',
      imgSrc: './assets/frontend_icons/grass_icon.png',
      tileType: TileType.LightGrass,
    },
    {
      name: 'Light Dirt',
      imgSrc: './assets/frontend_icons/dirt_icon.png',
      tileType: TileType.LightDirt,
    },
    {
      name: 'Shallow Water',
      imgSrc: './assets/frontend_icons/water_icon.png',
      tileType: TileType.ShallowWater,
    },
    {
      name: 'Forest',
      imgSrc: './assets/frontend_icons/forest_icon.png',
      tileType: TileType.Forest,
    },
    {
      name: 'Dark Grass',
      imgSrc: './assets/frontend_icons/grass_icon.png',
      tileType: TileType.DarkGrass,
    },
    {
      name: 'Dark Dirt',
      imgSrc: './assets/frontend_icons/dirt_icon.png',
      tileType: TileType.DarkDirt,
    },
    {
      name: 'Deep Water',
      imgSrc: './assets/frontend_icons/water_icon.png',
      tileType: TileType.DeepWater,
    },
    {
      name: 'Rock',
      imgSrc: './assets/frontend_icons/rocks_icon.png',
      tileType: TileType.Rock,
    },
  ];

  constructor(
    private userService: UserService,
  ) { }

  ngOnInit() {
  }

  changeTerrain(newValue, button) {
    this.assetChange(this.userService.assetToBeDrawn, 1);
    this.tileChange(this.userService.terrainToBeDrawn, 1);
    this.userService.terrainToBeDrawn = button.tileType;
    document.getElementById('Cursor').setAttribute('style','opacity:1');  
    document.getElementById('buttonSize' + this.userService.selectedBrush).setAttribute('style','opacity:0.5');
    for (let temp of this.terrainButtons) {
      document.getElementById (temp.name).setAttribute('style','opacity:1');
    }
    document.getElementById (button.name).setAttribute('style','opacity:0.5');
  }

  tileChange(num, num2) {
    switch (num) {
      case 0:
        document.getElementById('Light Dirt').setAttribute('style', 'opacity: ' + num2);
        break;
      case 1:
        document.getElementById('Dark Dirt').setAttribute('style', 'opacity: '  + num2);
        break;
      case 2:
        document.getElementById('Forest').setAttribute('style', 'opacity: '  + num2);
        break;
      case 3:
        document.getElementById('Light Grass').setAttribute('style', 'opacity: ' + num2);
        break;
      case 4:
        document.getElementById('Dark Grass').setAttribute('style', 'opacity: '  + num2);
        break;
      case 5:
        document.getElementById('Shallow Water').setAttribute('style', 'opacity: '  + num2);
        break;
      case 6:
        document.getElementById('Deep Water').setAttribute('style', 'opacity: '  + num2);
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
        document.getElementById('Footman').setAttribute('style', 'opacity: '  + num2);
        break;
      case 2:
        document.getElementById('Peasant').setAttribute('style', 'opacity: '  + num2);
        break;
      case 3:
        document.getElementById('Ranger').setAttribute('style', 'opacity: ' + num2);
        break;
      case 4:
        document.getElementById('Barracks').setAttribute('style', 'opacity: '  + num2);
        break;
      case 5:
        document.getElementById('Blacksmith').setAttribute('style', 'opacity: '  + num2);
        break;
      case 6:
        document.getElementById('Farm').setAttribute('style', 'opacity: '  + num2);
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
        document.getElementById('GuardTower').setAttribute('style', 'opacity: '  + num2);
        break;
      case 11:
        document.getElementById('Keep').setAttribute('style', 'opacity: '  + num2);
        break;
      case 12:
        document.getElementById('LumberMill').setAttribute('style', 'opacity: ' + num2);
        break;
      case 13:
        document.getElementById('ScoutTower').setAttribute('style', 'opacity: '  + num2);
        break;
      case 14:
        document.getElementById('TownHall').setAttribute('style', 'opacity: '  + num2);
        break;
    }
  }
}
