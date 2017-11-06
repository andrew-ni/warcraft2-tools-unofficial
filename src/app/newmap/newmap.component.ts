import { Component, OnInit } from '@angular/core';
import { Player } from 'player';
import {IOService} from 'services/io.service';
import { MapService } from 'services/map.service';
import { TileType } from 'tile';

@Component({
  selector: 'app-newmap',
  templateUrl: './newmap.component.html',
  styleUrls: ['./newmap.component.scss']
})
export class NewmapComponent implements OnInit {
  public allPlayerInfo: Player[];
  public currentPlayers: Player[];    // window of players visible to ui

  constructor(private ioService: IOService) { }

  ngOnInit() {
    this.allPlayerInfo = [new Player(0, 0, 0),  // set default game assets
    new Player(1, 0, 0),
    new Player(2, 0, 0),
    new Player(3, 0, 0),
    new Player(4, 0, 0),
    new Player(5, 0, 0),
    new Player(6, 0, 0),
    new Player(7, 0, 0),
    new Player(8, 0, 0)];

    this.updateNumPlayers(2);
    this.setListeners();
  }

  fun_close() {
    document.getElementById('newMapModal').setAttribute('style', 'display: none;');
  }

  private setListeners(): void {
    const createButton: HTMLButtonElement = document.getElementById('CreateMapButton') as HTMLButtonElement;
    createButton.addEventListener('click', () => this.buildMap());

    const numPlayersField: HTMLSelectElement = document.getElementById('NumPlayersField') as HTMLSelectElement;
    numPlayersField.addEventListener('click', () => this.updateNumPlayers(Number(numPlayersField.value)));
  }

  private buildMap(): void {
    console.log('buildmap');
    const name: string = (document.getElementById('NameField') as HTMLInputElement).value;
    const description: string = (document.getElementById('DescField') as HTMLInputElement).value;
    // const description = 'hello';
    const width: number = parseInt((document.getElementById('WidthField') as HTMLInputElement).value, 10);
    const height: number = parseInt((document.getElementById('HeightField') as HTMLInputElement).value, 10);

    this.ioService.initNew(name, description, width, height, TileType.LightGrass, this.allPlayerInfo.slice(0, this.currentPlayers.length + 1));
  }

  private updateNumPlayers(num: number): void {
    console.log(num);
    this.currentPlayers = this.allPlayerInfo.slice(1, num + 1);   // get whole range
  }
}

require('electron').ipcRenderer.on('menu:file:new', () => {
  document.getElementById('newMapModal').setAttribute('style', 'display: inline;');
});
