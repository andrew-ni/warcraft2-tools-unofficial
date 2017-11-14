import { Component, OnInit } from '@angular/core';
import { AssetsService } from 'services/assets.service';
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
    private assetsService: AssetsService
  ) { }

  ngOnInit() {
  }

  /**
   * iterates through selectedassets array and changes the owner if it differs from current owner
   */
  onclick() {
    if (this.userService.state === State.selectionTool) {
      console.log(this.userService.selectedAssets);
      for (const asset of this.userService.selectedAssets) {
        if (asset.owner !== this.userService.selectedPlayer) {
          this.assetsService.changeOwner(asset, this.userService.selectedPlayer);
        }
      }
    }
  }
}
