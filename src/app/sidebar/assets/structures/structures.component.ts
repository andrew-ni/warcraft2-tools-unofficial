import { Component, OnInit } from '@angular/core';
import { Structure, StructureType } from 'asset';
import { UserService } from 'services/user.service';

interface StructureButton {
  name: string;
  imgSrc: string;
  structureType: StructureType;
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
      structureType: StructureType.Townhall,
    },
    {
      name: 'Barracks',
      imgSrc: './assets/frontend_icons/barracks_icon.png',
      structureType: StructureType.Barracks,
    },
    {
      name: 'GoldMine',
      imgSrc: './assets/frontend_icons/goldmine_icon.png',
      structureType: StructureType.GoldMine,
    },
  ];

  constructor(
    private userService: UserService,
  ) { }

  ngOnInit() {
  }

}
