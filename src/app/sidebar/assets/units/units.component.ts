import { Component, OnInit } from '@angular/core';
import { AssetType } from 'asset';
import { UserService } from 'services/user.service';

interface UnitButton {
  name: string;
  imgSrc: string;
  unitType: AssetType;
}

interface CursorButton {
  name: string;
  imgSrc: string;
}

@Component({
  selector: 'app-units',
  templateUrl: './units.component.html',
  styleUrls: ['./units.component.scss']
})
export class UnitsComponent implements OnInit {

  cursorButtons: CursorButton[] = [
    {
      name: 'Cursor',
      imgSrc: './assets/frontend_icons/cursor_icon.png',
    },
  ];

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

}
