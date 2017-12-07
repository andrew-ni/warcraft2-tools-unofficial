import { Component, NgZone, OnInit } from '@angular/core';
import { dialog, Menu } from 'electron';
import { MapService } from 'services/map.service';

import * as fs from 'fs';

@Component({
  selector: 'app-ai',
  templateUrl: './ai.component.html',
  styleUrls: ['./ai.component.scss']
})

export class AiComponent implements OnInit {
  // require .lua extension
  static options = {
    filters: [
      { name: 'Lua Script (.lua)', extensions: ['lua'] }
    ]
  };

  private tests = [];
  private s = 'a';

  constructor(
    private ngZone: NgZone,
    private mapService: MapService,
  ) { }

  ngOnInit() { }

  /**
   * upload new difficulty lua script to map service
   */
  async newDifficulty() {
    require('electron').remote.dialog.showOpenDialog(this.constructor['options'], (paths: string[]) => {
      if (paths === undefined) return;
      let filename = paths[0];
      fs.readFile(filename, 'utf8', (err: Error, data: string) => {
        if (err) {
          console.log(err);
        } else {
          filename = filename.split('/').slice(-1)[0];
          filename = './scripts/' + filename;
          this.ngZone.run(() => { this.mapService.difficulty.push(filename);
                                  this.mapService.difficultyData.push(data); });
        }
      });
    });
  }

  /**
   * remove difficulty lua script from map service
   * @param index index of to be removed in map service array
   */
  delDifficulty(index: number) {
    this.ngZone.run(() => { this.mapService.difficulty.splice(index, 1);
                            this.mapService.difficultyData.splice(index, 1); });
  }

  /**
   * upload new event lua script to map service
   */
  async newEvent() {
    require('electron').remote.dialog.showOpenDialog(this.constructor['options'], (paths: string[]) => {
      if (paths === undefined) return;
      let filename = paths[0];
      fs.readFile(filename, 'utf8', (err: Error, data: string) => {
        if (err) {
          console.log(err);
        } else {
          filename = filename.split('/').slice(-1)[0];
          filename = './scripts/' + filename;
          this.ngZone.run(() => { this.mapService.events.push(filename);
                                  this.mapService.eventsData.push(data); });
        }
      });
    });
  }

  /**
   * remove event lua script from map service
   * @param index index of to be removed in map service array
   */
  delEvent(index: number) {
    this.ngZone.run(() => { this.mapService.events.splice(index, 1);
                            this.mapService.eventsData.splice(index, 1); });
  }

  /**
   * add new undefined trigger to map service
   */
  newTrigger() {
    this.ngZone.run(() => { this.mapService.triggerss.push(['x x x x']); });
  }

  /**
   * remove trigger from map service
   * @param index index of to be removed in map service array
   */
  delTrigger(index: number) {
    this.ngZone.run(() => { this.mapService.triggerss.splice(index, 1); });
  }
}
