import { ApplicationRef, Injectable } from '@angular/core';
import { AssetType } from 'asset';
import { ipcRenderer } from 'electron';
import { Dimension } from 'interfaces';
import { TileType } from 'tile';

enum State {
  noSelection,
  terrainSelected,
  assetSelected,
}

/**
 * User Service is a repository for user state, all services / components
 * that depend on it should read from an injected instance of this service
 * if it needs user state (ex: MapService map edits depends on user selected service).
 */
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

  /** The currently selected player's number. Defaults to 1 */
  private _selectedPlayer = 1;

  /** Used during new map creation */
  private newMapName: string;

  /** Used during new map creation */
  private newMapDimensions: Dimension;

  /** Used to keep track of current tab */
  public _activeView = 0;

  constructor(
    private appref: ApplicationRef,
  ) {
    /** On initialization, set default brush to Terrain and use TileType.Rock */
    this.selectedTerrain = TileType.Rock;
    ipcRenderer.on('menu:file:animation', () => {
      this._activeView = 1;
      console.log('animation switch');
      this.appref.tick();
    });
    ipcRenderer.on('menu:file:audio', () => { this._activeView = 0; this.appref.tick(); });
    ipcRenderer.on('menu:file:tileset', () => this._activeView = 3);

  }

  /**
   * Classes that inject UserService call these getters in order to change the current palette
   * In [sidebar].component.html, call these on button clicks, e.g. (click)="userService.changeTerrain(button.tileType)"
   */
  get selectedMapElement() { return this._selectedMapElement; }
  get selectedTerrain() { return this._selectedTerrain; }
  get selectedAsset() { return this._selectedAsset; }
  get selectedPlayer() { return this._selectedPlayer; }
  // get activeView() { return this._activeView; }



  /**
   * On terrain select, change _selectedMapElement, _selectedTerrain, and _state
   * @param tileType tileType to change state to
   */
  set selectedTerrain(tileType) {
    this._selectedMapElement = this._selectedTerrain = tileType;
    this._state = State.terrainSelected;
  }

  /**
   * On asset select, change _selectedMapElement, _selectedAsset, and _state
   * @param assetType assetType to change state to
   */
  set selectedAsset(assetType) {
    this._selectedMapElement = this._selectedAsset = assetType;
    this._state = State.assetSelected;
  }

  /**
   * On changing player selection, change_selectedPlayer
   * @param id id to change _selectedPlayer to
   */
  set selectedPlayer(id) {
    this._selectedPlayer = id;
    console.log('player number = ', id);
  }

  /**
   * Will call one of the given callbacks based on whether terrain or asset is
   * selected in the sidebar.
   * @param applyTerrain A callback that takes the selected tileType. Called if a Tile is the active selection.
   * @param applyAsset A callback that takes the selected AssetType. Called if an Asset is the active selection.
   */
  applySelectedType(applyTerrain: (tt: TileType) => void, applyAsset: (at: AssetType) => void) {
    switch (this._state) {
      case State.terrainSelected: applyTerrain(this._selectedTerrain); return;
      case State.assetSelected: applyAsset(this._selectedAsset); return;

      default: break;
    }
  }
}

