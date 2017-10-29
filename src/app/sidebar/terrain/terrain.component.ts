import { Component, OnInit } from '@angular/core';
import { TileType } from 'tile';
import { UserService } from 'services/user.service';


interface TerrainButton {
  name: string;
  imgSrc: string;
  tileType: TileType;
}

@Component({
  selector: 'app-terrain',
  templateUrl: './terrain.component.html',
  styleUrls: ['./terrain.component.scss']
})
export class TerrainComponent implements OnInit {

  terrainButtons: TerrainButton[] = [
    {
      name: 'Light Grass',
      imgSrc: './assets/frontend_icons/grass_icon.png',
      tileType: TileType.LightGrass,
    },
    {
      name: 'Light Dirt',
      imgSrc: './assets/frontend_icons/dirt_icon.png',
      tileType: TileType.LightDirt,
    },
    {
      name: 'Shallow Water',
      imgSrc: './assets/frontend_icons/water_icon.png',
      tileType: TileType.LightDirt,
    },
    {
      name: 'Forest',
      imgSrc: './assets/frontend_icons/forest_icon.png',
      tileType: TileType.LightDirt,
    },
    {
      name: 'Dark Grass',
      imgSrc: './assets/frontend_icons/grass_icon.png',
      tileType: TileType.DarkGrass,
    },
    {
      name: 'Dark Dirt',
      imgSrc: './assets/frontend_icons/dirt_icon.png',
      tileType: TileType.DarkDirt,
    },
    {
      name: 'Deep Water',
      imgSrc: './assets/frontend_icons/water_icon.png',
      tileType: TileType.DeepWater,
    },
    {
      name: 'Rock',
      imgSrc: './assets/frontend_icons/rocks_icon.png',
      tileType: TileType.Rock,
    },
  ];


  constructor(
    private userService: UserService,
  ) { }

  ngOnInit() {
  }
}
