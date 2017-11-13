import { Component, OnInit } from '@angular/core';
import { UserService } from 'services/user.service';

import { AssetType } from 'asset';

interface CursorButton {
  name: string;
  imgSrc: string;
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
    },
    {
      name: 'Paint',
      imgSrc: './assets/frontend_icons/paint_tool.png',
    },
  ];

  constructor(private userService: UserService) { }

  ngOnInit() {
  }
}
