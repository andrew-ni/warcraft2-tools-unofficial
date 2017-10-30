import { Component, OnInit } from '@angular/core';
import { MapService } from 'services/map.service';
import { Player } from 'player';

@Component({
  selector: 'app-newmap',
  templateUrl: './newmap.component.html',
  styleUrls: ['./newmap.component.scss']
})
export class NewmapComponent implements OnInit {
  public allPlayerInfo: Player[];
  public currentPlayers: Player[];

  constructor(private mapService: MapService) { }

  ngOnInit() {
    this.allPlayerInfo = [{'id': 0, 'gold': 0, 'lumber': 0, 'assets': []},
                          {'id': 1, 'gold': 0, 'lumber': 0, 'assets': []},
                          {'id': 2, 'gold': 0, 'lumber': 0, 'assets': []},
                          {'id': 3, 'gold': 0, 'lumber': 0, 'assets': []},
                          {'id': 4, 'gold': 0, 'lumber': 0, 'assets': []},
                          {'id': 5, 'gold': 0, 'lumber': 0, 'assets': []},
                          {'id': 6, 'gold': 0, 'lumber': 0, 'assets': []},
                          {'id': 7, 'gold': 0, 'lumber': 0, 'assets': []},
                          {'id': 8, 'gold': 0, 'lumber': 0, 'assets': []}];
    this.currentPlayers = this.allPlayerInfo.slice(1, 9);

    const button: HTMLButtonElement = document.getElementById('CreateMapButton') as HTMLButtonElement;

    button.addEventListener('click', (event) => {
      this.buildMap();
    });
  }

  fun_close(){
    document.getElementById('newMapModal').setAttribute('style', 'display: none;');
  }

  private buildMap(): void {
    console.log('buildmap');
  }
}

require('electron').ipcRenderer.on('menu:file:new', () => {
  document.getElementById('newMapModal').setAttribute('style', 'display: inline;');
});
