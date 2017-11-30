import { Component, NgZone, OnInit } from '@angular/core';
import { dialog, Menu } from 'electron';
import { MapService } from 'services/map.service';

@Component({
  selector: 'app-ai',
  templateUrl: './ai.component.html',
  styleUrls: ['./ai.component.scss']
})

export class AiComponent implements OnInit {
  static options = {
    filters: [
      { name: 'Lua Script (.lua)', extensions: ['lua'] }
    ]
  };

  constructor(
    private ngZone: NgZone,
    private mapService: MapService,
  ) { }

  ngOnInit() { }

  async newDifficulty() {
    require('electron').remote.dialog.showOpenDialog(this.constructor['options'], (paths: string[]) => {
      if (paths === undefined) return;
      const filename = paths[0];
      this.ngZone.run(() => { this.mapService.difficulty.push(filename); });
    });
  }

  delDifficulty(index: number) {
    this.ngZone.run(() => { this.mapService.difficulty.splice(index, 1); });
  }

  async newEvent() {
    require('electron').remote.dialog.showOpenDialog(this.constructor['options'], (paths: string[]) => {
      if (paths === undefined) return;
      const filename = paths[0];
      this.ngZone.run(() => { this.mapService.events.push(filename); });
    });
  }

  delEvent(index: number) {
    this.ngZone.run(() => { this.mapService.events.splice(index, 1); });
  }

  newTrigger() {
    this.ngZone.run(() => { this.mapService.triggers.push('x x x x'); });
  }

  delTrigger(index: number) {
    this.ngZone.run(() => { this.mapService.triggers.splice(index, 1); });
  }
}
