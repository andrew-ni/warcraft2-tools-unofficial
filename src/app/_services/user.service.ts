import { Injectable } from '@angular/core';
import { AssetType } from 'asset';
import { Dimension } from 'interfaces';
import { TileType } from 'tile';

enum State {
  noSelection,
  terrainSelected,
  assetSelected,
}

// User Service is a repository for user state, all services / components
// that depend on it should read from an injected instance of this service
// if it needs user state (ex: MapService map edits depends on user selected
// service)
@Injectable()
export class UserService {
  /** Either noSelection, terrainSelected, assetSelected */
  private _state = State.noSelection;

  /** The TileType of the terrain that is selected currently */
  private _selectedTerrain: TileType;

  /** The AssetType of the terrain that is selected currently */
  private _selectedAsset: AssetType;

  /** The TileType or AssetType of whatever is selected currently */
  private _selectedMapElement: TileType | AssetType;

  /** The currently selected player's number */
  private _selectedPlayer: number;

  /** Used during new map creation */
  private newMapName: string;

  /** Used during new map creation */
  private newMapDimensions: Dimension;

  constructor() {
    /** On initialization, set default brush to Terrain and use TileType.Rock */
    this.selectedTerrain = TileType.Rock;
  }

  /**
   * Classes that inject UserService call these getters in order to change the current palette
   * In [sidebar].component.html, call these on button clicks, e.g. (click)="userService.changeTerrain(button.tileType)"
   */
  get selectMapElement() { return this._selectedMapElement; }
  get selectedTerrain() { return this._selectedTerrain; }
  get selectedAsset() { return this._selectedAsset; }
  get selectedPlayer() { return this._selectedPlayer; }

  /**
   * @param tileType tileType to change state to
   * On terrain select, change _selectedMapElement, _selectedTerrain, and _state
   */
  set selectedTerrain(tileType) {
    this._selectedMapElement = this._selectedTerrain = tileType;
    this._state = State.terrainSelected;
  }

  /**
   * @param assetType assetType to change state to
   * On asset select, change _selectedMapElement, _selectedAsset, and _state
   */
  set selectedAsset(assetType) {
    this._selectedMapElement = this._selectedAsset = assetType;
    this._state = State.assetSelected;
  }

  /**
   * @param id id to change _selectedPlayer to
   * On changing player selection, change_selectedPlayer
   */
  set selectedPlayer(id) {
    this._selectedPlayer = id;
    console.log('player number = ', id);
  }

  /**
   * @param applyTerrain
   * @param applyAsset
   * Not quite sure what this function does. Will ask Ben
   */
  applySelectedType(applyTerrain: (tt: TileType) => void, applyAsset: (at: AssetType) => void) {
    switch (this._state) {
      case State.terrainSelected: applyTerrain(this._selectedTerrain); return;
      case State.assetSelected: applyAsset(this._selectedAsset); return;

      default: break;
    }
  }
}

