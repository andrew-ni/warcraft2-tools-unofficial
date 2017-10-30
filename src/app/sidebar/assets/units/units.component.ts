import { Component, OnInit } from '@angular/core';
import { UnitType } from 'asset';
import { UserService } from 'services/user.service';

interface UnitButton {
  name: string;
  imgSrc: string;
  unitType: UnitType;
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
      unitType: UnitType.Peasant,
    },
    {
      name: 'Footman',
      imgSrc: './assets/frontend_icons/footman_icon.png',
      unitType: UnitType.Footman,
    },
  ];

  constructor(
    private userService: UserService,
  ) { }

  ngOnInit() {
  }

}
