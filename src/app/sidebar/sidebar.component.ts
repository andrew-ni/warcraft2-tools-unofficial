import { Component, OnInit } from '@angular/core';
import { UserService } from 'services/user.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  constructor(private userService: UserService) {}

  ngOnInit() {
  }
}
