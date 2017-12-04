import { Component, OnInit } from '@angular/core';
import { AssetType } from 'asset';
import { UserService } from 'services/user.service';

interface StructureButton {
  name: string;
  imgSrc: string;
  structureType: AssetType;
}

@Component({
  selector: 'app-structures',
  templateUrl: './structures.component.html',
  styleUrls: ['./structures.component.scss']
})
export class StructuresComponent implements OnInit {

  structureButtons: StructureButton[] = [
    {
      name: 'Townhall',
      imgSrc: './assets/frontend_icons/townhall_icon.png',
      structureType: AssetType.TownHall,
    },
    {
      name: 'Keep',
      imgSrc: './assets/frontend_icons/keep_icon.png',
      structureType: AssetType.Keep,
    },
    {
      name: 'Castle',
      imgSrc: './assets/frontend_icons/castle_icon.png',
      structureType: AssetType.Castle,
    },
    {
      name: 'Barracks',
      imgSrc: './assets/frontend_icons/barracks_icon.png',
      structureType: AssetType.Barracks,
    },
    {
      name: 'Blacksmith',
      imgSrc: './assets/frontend_icons/blacksmith_icon.png',
      structureType: AssetType.Blacksmith,
    },
    {
      name: 'Farm',
      imgSrc: './assets/frontend_icons/farm_icon.png',
      structureType: AssetType.Farm,
    },
    {
      name: 'LumberMill',
      imgSrc: './assets/frontend_icons/lumbermill_icon.png',
      structureType: AssetType.LumberMill,
    },
    {
      name: 'CannonTower',
      imgSrc: './assets/frontend_icons/cannontower_icon.png',
      structureType: AssetType.CannonTower,
    },
    {
      name: 'GuardTower',
      imgSrc: './assets/frontend_icons/guardtower_icon.png',
      structureType: AssetType.GuardTower,
    },
    {
      name: 'ScoutTower',
      imgSrc: './assets/frontend_icons/scouttower_icon.png',
      structureType: AssetType.ScoutTower,
    },
    {
      name: 'GoldMine',
      imgSrc: './assets/frontend_icons/goldmine_icon.png',
      structureType: AssetType.GoldMine,
    },
  ];

  constructor(
    private userService: UserService,
  ) { }

  ngOnInit() {
  }

  changeStructures(newValue, button) {
    console.log(this.userService.assetToBeDrawn);
    
    this.assetChange(this.userService.assetToBeDrawn, 1);
    this.userService.assetToBeDrawn = button.structureType;
    document.getElementById('Cursor').setAttribute('style','opacity:1');  
    document.getElementById('buttonSize' + this.userService.selectedBrush).setAttribute('style','opacity:1');
    this.tileChange(this.userService.terrainToBeDrawn, 1);
    document.getElementById(button.name).setAttribute('style','opacity:0.5');
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
        document.getElementById('Townhall').setAttribute('style', 'opacity: '  + num2);
        break;
    }
  }
}

