import { Component, OnInit } from '@angular/core';
import { TileType } from 'tile';


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
      tileType: TileType.LightGrass,
    },
  ];


  constructor() { }

  ngOnInit() {
  }
}
