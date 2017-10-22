import { Component, OnInit, Input } from '@angular/core';
import { Tile, TileType } from 'tile';

@Component({
  selector: 'app-tile',
  templateUrl: './tile.component.html',
  styleUrls: ['./tile.component.scss']
})
export class TileComponent implements OnInit {
  @Input() private tile: Tile;
  @Input() private x: number;
  @Input() private y: number;

  constructor() { }

  ngOnInit() {
  }

  getFilePath() {
    switch (this.tile.tileType) {
      case TileType.DarkGrass: return 'assets/tiles/DarkGrass.png';
      case TileType.LightGrass: return 'assets/tiles/LightGrass.png';
      case TileType.DarkDirt: return 'assets/tiles/DarkDirt.png';
      case TileType.LightDirt: return 'assets/tiles/LightDirt.png';
      case TileType.Rock: return 'assets/tiles/Rock.png';
<<<<<<< HEAD
      // case TileType.RockPartial: return 'assets/tiles/RockPartial.png';
      case TileType.Forest: return 'assets/tiles/Forest.png';
      // case TileType.ForestPartial: return 'assets/tiles/ForestPartial.png';
=======
      case TileType.Forest: return 'assets/tiles/Forest.png';
>>>>>>> c3311feef246a47acae6f576a22354db6a876206
      case TileType.DeepWater: return 'assets/tiles/DeepWater.png';
      case TileType.ShallowWater: return 'assets/tiles/ShallowWater.png';

      default: console.error('Wrong Tile Type!');
    }
  }
}
