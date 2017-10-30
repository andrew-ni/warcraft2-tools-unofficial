import { Component, OnInit } from '@angular/core';

interface StructureButton {
  name: string;
  imgSrc: string;
  // structure type;
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
    },
    {
      name: 'Barracks',
      imgSrc: './assets/frontend_icons/barracks_icon.png',
    },
  ];

  constructor() { }

  ngOnInit() {
  }

}
