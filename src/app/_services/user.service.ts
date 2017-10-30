import { Injectable } from '@angular/core';
import { TileType } from 'tile';
import { UnitType, Structure } from 'asset';
import { Dimension } from '../_interfaces/dimension';   // is this the right way to do this

// User Service is a repository for user state, all services / components
// that depend on it should read from an injected instance of this service
// if it needs user state (ex: MapService map edits depends on user selected
// service)
@Injectable()
export class UserService {
  public selectedTerrain = TileType.Rock;
  public selectedUnit: UnitType;
  public selectedStructure: Structure;

  public newMapName: string;      // used during new map creation (might not be necessary)
  public newMapDimensions: Dimension;

  constructor() {
    // set default unit and structure here
  }

}
