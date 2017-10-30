import { Injectable, EventEmitter } from '@angular/core';
import { TileType } from 'tile';
import { Unit, UnitType, Structure, Asset } from 'asset';
import { Dimension } from '../_interfaces/dimension';   // is this the right way to do this

// User Service is a repository for user state, all services / components
// that depend on it should read from an injected instance of this service
// if it needs user state (ex: MapService map edits depends on user selected
// service)
@Injectable()
export class UserService {
  // 0 = terrain, 1 = units, 2 = structures
  private state: number;
  private selectedTerrain: TileType;
  private selectedUnit: UnitType;
  private selectedStructure: Structure;

  private newMapName: string;      // used during new map creation (might not be necessary)
  private newMapDimensions: Dimension;

  constructor() {
    // Set default brush to Terrain and use TileType.Rock
    this.state = 0;
    this.selectedTerrain = TileType.Rock;
  }

  // Classes that inject the User Service call these functions in order to change the current palette.
  // in [sidebar].component.html, call these on button clicks, e.g. (click)="userService.changeTerrain(button.tileType)"
  public changeTerrain(selected: TileType): void {
    this.state = 0;
    this.selectedTerrain = selected;
  }

  public changeUnit(selected: UnitType): void {
    this.state = 1;
    this.selectedUnit = selected;
  }

  public changeStructure(selected: Structure): void {
    this.state = 2;
    this.selectedStructure = selected;
  }

  // Call this function to get the current palette.
  public getPalette(): any {
    switch (this.state) {
      case 0: {
        return this.selectedTerrain;
      }
      case 1: {
        return this.selectedUnit;
      }
      case 2: {
        return this.selectedStructure;
      }
    }
  }

  public getState(): number {
    return this.state;
  }


}
