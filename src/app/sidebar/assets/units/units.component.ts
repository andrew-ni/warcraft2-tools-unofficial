import { Component, OnInit } from '@angular/core';
import { AssetType } from 'asset';
import { UserService } from 'services/user.service';

interface UnitButton {
  name: string;
  imgSrc: string;
  unitType: AssetType;
}

@Component({
  selector: 'app-units',
  templateUrl: './units.component.html',
  styleUrls: ['./units.component.scss']
})
export class UnitsComponent implements OnInit {
  unitButtons: UnitButton[] = [
    {
      name: 'Peasant',
      imgSrc: './assets/frontend_icons/peasant_icon.png',
      unitType: AssetType.Peasant,
    },
    {
      name: 'Footman',
      imgSrc: './assets/frontend_icons/footman_icon.png',
      unitType: AssetType.Footman,
    },
    {
      name: 'Archer',
      imgSrc: './assets/frontend_icons/archer_icon.png',
      unitType: AssetType.Archer,
    },
    {
      name: 'Ranger',
      imgSrc: './assets/frontend_icons/ranger_icon.png',
      unitType: AssetType.Ranger,
    },
  ];

  constructor(
    private userService: UserService,
  ) { }

  ngOnInit() {
  }

  changeUnits(newValue, button) {
    this.assetChange(this.userService.assetToBeDrawn, 1);
    this.userService.assetToBeDrawn = button.unitType;
    document.getElementById('Cursor').setAttribute('style', 'opacity:1');
    document.getElementById('buttonSize' + this.userService.selectedBrush).setAttribute('style', 'opacity:1');
    this.tileChange(this.userService.terrainToBeDrawn, 1);
    document.getElementById(button.name).setAttribute('style', 'opacity:0.5');
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
}
