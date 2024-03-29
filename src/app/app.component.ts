import { Component, ViewChild } from '@angular/core';
import { window } from 'rxjs/operator/window';
import { MapService } from 'services/map.service';
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
    private mapService: MapService,
  ) { }

  /**
   * Handles changing tabs using the labelled buttons
   * TODO: Don't use strings, use ngClass
   * @param tabName a string corresponding to the tab to open.
   */
  openTab(tabName) {
    let i;
    const x = document.getElementsByClassName('tab') as HTMLCollectionOf<HTMLElement>;
    for (i = 0; i < x.length; i++) {
      x[i].style.display = 'none';
    }
    if (tabName === 'main') {
      this.mapService.assetsUpdated.next({ y: 0, x: 0, height: this.mapService.height, width: this.mapService.width });
      this.mapService.tilesUpdated.next({ y: 0, x: 0, height: this.mapService.height, width: this.mapService.width });
      document.getElementById(tabName).style.display = 'flex';
      document.getElementById('content').style.display = 'none';
    } else {
      if (tabName === 'animation') {
        this.animation.focus();
      }
      document.getElementById(tabName).style.display = 'block';
      document.getElementById('content').style.display = 'block';
    }
  }
}
