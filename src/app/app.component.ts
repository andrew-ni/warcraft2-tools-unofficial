import { Component } from '@angular/core';
import { ipcRenderer } from 'electron';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ECS160 Tools';

  constructor() {
    // register listener on construction
    ipcRenderer.on('menu:file:new', (event) => {
      console.log('menu:file:new');
    });
  }

  buttonClick() {
    this.title = 'button clicked';
  }
}
