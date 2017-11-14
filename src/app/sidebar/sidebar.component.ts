import { Component, OnInit } from '@angular/core';
import { UserService } from 'services/user.service';

import { AssetType } from 'asset';

enum State {
  noSelection,
  terrainBrush,
  assetBrush,
  selectionTool,
}

interface CursorButton {
  name: string;
  imgSrc: string;
  action: number;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  cursorButtons: CursorButton[] = [
    {
      name: 'Select',
      imgSrc: './assets/frontend_icons/select_tool.png',
      action: 3,
    },
    {
      name: 'Paint',
      imgSrc: './assets/frontend_icons/paint_tool.png',
      action: 2,
    },
  ];

  constructor(private userService: UserService) { }

  ngOnInit() {
  }

  changeState(state: State) {
    this.userService.state = state;
    console.log(this.userService.state);
  }

}
