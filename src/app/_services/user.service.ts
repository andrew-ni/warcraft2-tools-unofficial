import { Injectable, EventEmitter } from '@angular/core';
import { TileType } from 'tile';
import { AssetType } from 'asset';
import { Dimension } from '../_interfaces/dimension';   // is this the right way to do this

// User Service is a repository for user state, all services / components
// that depend on it should read from an injected instance of this service
// if it needs user state (ex: MapService map edits depends on user selected
// service)
@Injectable()
export class UserService {
  private _state = State.noSelection;
  private _selectedTerrain: TileType;
  private _selectedUnit: AssetType;
  private _selectedStructure: AssetType;
  private _selectedMapElement: TileType | AssetType;
  private _selectedPlayer: number;

  private newMapName: string;      // used during new map creation (might not be necessary)
  private newMapDimensions: Dimension;

  constructor() {
    // Set default brush to Terrain and use TileType.Rock
    this.selectedTerrain = TileType.Rock;
  }

  // Classes that inject the User Service call these functions in order to change the current palette.
  // in [sidebar].component.html, call these on button clicks, e.g. (click)="userService.changeTerrain(button.tileType)"
  get selectMapElement() { return this._selectedMapElement; }
  get selectedTerrain() { return this._selectedTerrain; }
  get selectedUnit() { return this._selectedUnit; }
  get selectedStructure() { return this._selectedStructure; }
  get selectedPlayer() { return this._selectedPlayer; }

  set selectedTerrain(tileType) {
    this._selectedMapElement = this._selectedTerrain = tileType;
    this._state = State.terrainSelected;
  }

  set selectedUnit(unitType) {
    this._selectedMapElement = this._selectedUnit = unitType;
    this._state = State.unitSelected;
  }

  set selectedStructure(structureType) {
    this._selectedMapElement = this._selectedStructure = structureType;
    this._state = State.structureSelected;
  }

  set selectedPlayer(id) {
    this._selectedPlayer = id;
    console.log('player number = ', id);
  }

  applySelectedType(applyTerrain: (tt: TileType) => void, applyAsset: (at: AssetType) => void ) {
    switch (this._state) {
      case State.terrainSelected: applyTerrain(this._selectedTerrain); return;
      case State.unitSelected: applyAsset(this._selectedMapElement as AssetType); return;

      default:
        break;
    }
  }
}

enum State {
  noSelection,
  terrainSelected,
  unitSelected,
  structureSelected,
}
