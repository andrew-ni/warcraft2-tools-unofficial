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

}
