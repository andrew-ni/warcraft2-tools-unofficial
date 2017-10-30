import { Component, OnInit } from '@angular/core';

interface UnitButton {
  name: string;
  imgSrc: string;
  // structure type;
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
    },
    {
      name: 'Footman',
      imgSrc: './assets/frontend_icons/footman_icon.png',
    },
  ];

  constructor() { }

  ngOnInit() {
  }

}
