import { Component, OnInit } from '@angular/core';
import { AssetsService } from 'services/assets.service';
import { MapService } from 'services/map.service';
import { UserService } from 'services/user.service';

enum State {
  noSelection,
  terrainBrush,
  assetBrush,
  selectionTool,
}

@Component({
  selector: 'app-assets',
  templateUrl: './assets.component.html',
  styleUrls: ['./assets.component.scss']
})
export class AssetsComponent implements OnInit {

  constructor(
    private userService: UserService,
    private assetsService: AssetsService,
    private mapService: MapService
  ) { }

  ngOnInit() {
  }

  /**
   * iterates through selectedassets array and changes the owner if it differs from current owner
   */
  switchPlayer() {
    if (this.userService.state === State.selectionTool) {
      for (const asset of this.userService.selectedAssets) {
          this.assetsService.updateOwner(this.userService.selectedAssets, this.userService.selectedPlayer);
      }
      // update each region in the array
      for (const reg of this.userService.selectedRegions){
        this.mapService.assetsUpdated.next(reg);
      }
      // refocus onto the canvas instead of sidebar to allow eventhandlers to listen
      const ac = document.getElementById( 'assetCanvas' );
      ac.focus();

    }
  }
}
