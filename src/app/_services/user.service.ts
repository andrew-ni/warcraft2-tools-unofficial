import { Injectable } from '@angular/core';
import { TileType } from 'tile';
import { Unit, Structure } from 'asset';
import { Dimension } from '../_interfaces/dimension';   // is this the right way to do this

@Injectable()
export class UserService {
  public selectedTerrain = TileType.Rock;
  public selectedUnit: Unit;
  public selectedStructure: Structure;

  public newMapName: string;
  public newMapDimensions: Dimension;

  constructor() {
    // set default unit and structure here
  }

}
