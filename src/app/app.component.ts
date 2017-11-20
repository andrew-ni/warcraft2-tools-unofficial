import { Component, ElementRef, ViewChild } from '@angular/core';
import { AssetsService } from 'services/assets.service';
import { IOService } from 'services/io.service';
import { MapService } from 'services/map.service';
import { UserService } from 'services/user.service';
import { AnimationComponent } from './animation/animation.component';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild(AnimationComponent) animation: AnimationComponent;
  title = 'ECS160 Tools';

  constructor(
    private userService: UserService,
  ) { }

  openTab(tabName) {
    let i;
    const x = document.getElementsByClassName('tab') as HTMLCollectionOf<HTMLElement>;
    for (i = 0; i < x.length; i++) {
        x[i].style.display = 'none';
    }
    if (tabName === 'main') {
      document.getElementById(tabName).style.display = 'flex';
    } else {
      if (tabName === 'animation') {
        this.animation.focus();
      }
      document.getElementById(tabName).style.display = 'inline-block';
    }
  }
}
