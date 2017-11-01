import { Component, OnInit } from '@angular/core';
import { UserService } from 'services/user.service';

@Component({
  selector: 'app-assets',
  templateUrl: './assets.component.html',
  styleUrls: ['./assets.component.scss']
})
export class AssetsComponent implements OnInit {

  constructor(
    private userService: UserService,
  ) { }

  ngOnInit() {
  }

}
