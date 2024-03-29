import { ApplicationRef, Injectable } from '@angular/core';
import { Asset, AssetType } from 'asset';
import { Dimension, Region } from 'interfaces';
import { TileType } from 'tile';

export enum State {
  noSelection,
  terrainBrush,
  assetBrush,
  selectionTool,
}

/**
 * User Service is a repository for user state, all services / components
 * that depend on it should read from an injected instance of this service
 * if it needs user state (ex: MapService map edits depends on user selected service).
 */
@Injectable()
export class UserService {
  /** Either noSelection, terrainBrush, assetBrush */
  private _state = State.noSelection;

  /** The TileType of the terrain that is selected currently */
  private _terrainToBeDrawn: TileType;

  /** The AssetType of the terrain that is selected currently */
  private _assetToBeDrawn: AssetType;

  /** The TileType or AssetType of whatever is selected currently */
  private _mapElementToBeDrawn: TileType | AssetType;

  /** The currently selected player's number. Defaults to 1 */
  private _selectedPlayer = 1;

  /** Used during new map creation */
  private newMapName: string;

  /** Used during new map creation */
  private newMapDimensions: Dimension;

  /** The array of currently selected assets by mouse tool */
  private _selectedAssets: Asset[];

  /** THe array of regions selected by the mouse tool */
  private _selectedRegions: Region[];

  /** The BrushSize of the terrain brush that is selected currently (1x1, 3x3, 9x9). Defaults to 1x1 */
  private _selectedBrush = 1;

  constructor(
    private appref: ApplicationRef,
  ) {
    /** On initialization, set default brush to Terrain and use TileType.Rock */
    this.terrainToBeDrawn = TileType.Rock;
    this._selectedAssets = [];
    this._selectedRegions = [];
  }

  /**
   * Classes that inject UserService call these getters in order to change the current palette
   * In [sidebar].component.html, call these on button clicks, e.g. (click)="userService.changeTerrain(button.tileType)"
   */
  get mapElementToBeDrawn() { return this._mapElementToBeDrawn; }
  get terrainToBeDrawn() { return this._terrainToBeDrawn; }
  get assetToBeDrawn() { return this._assetToBeDrawn; }
  get selectedPlayer() { return this._selectedPlayer; }
  get selectedBrush() { return this._selectedBrush; }
  get state() { return this._state; }
  get selectedAssets() { return this._selectedAssets; }
  get selectedRegions() { return this._selectedRegions; }

  /**
   * On terrain select, change _mapElementToBeDrawn, _terrainToBeDrawn, and _state
   * @param tileType tileType to change state to
   */
  set terrainToBeDrawn(tileType) {
    this.clearSelections();
    this._mapElementToBeDrawn = this._terrainToBeDrawn = tileType;
    this._state = State.terrainBrush;
  }

  /**
   * On asset select, change _mapElementToBeDrawn, _assetToBeDrawn, and _state
   * @param assetType assetType to change state to
   */
  set assetToBeDrawn(assetType) {
    this.clearSelections();
    this._mapElementToBeDrawn = this._assetToBeDrawn = assetType;
    this._state = State.assetBrush;
  }

  /**
   * On changing player selection, change_selectedPlayer
   * @param id id to change _selectedPlayer to
   */
  set selectedPlayer(id) {
    this._selectedPlayer = id;
  }

  /**
   * On brush selection, change _selectedBrush
   * @param id id to change _selectedBrush to
   */
  set selectedBrush(id) {
    this._selectedBrush = id;
    console.log('brush size = ', id);
  }

  /*
   * On assigning to selected assets, change selectedAssetes
   * @param assets assets to assign to
   */
  set selectedAssets(assets) {
    this._selectedAssets = assets;
    this._state = State.selectionTool;
  }

  /**
   * When a region is selected by the mouse tool
   * @param reg region to be assigned to
   */
  set selectedRegions(regArr) {
    this._selectedRegions = regArr;
    this._state = State.selectionTool;
  }

  /**
   * empties selected regions and assets when switching states
   */
  clearSelections() {
    this._selectedRegions = [];
    this._selectedAssets = [];
  }

  /**
   * Will call one of the given callbacks based on whether terrain or asset is
   * selected in the sidebar.
   * @param applyTerrain A callback that takes the selected tileType. Called if a Tile is the active selection.
   * @param applyAsset A callback that takes the selected AssetType. Called if an Asset is the active selection.
   */
  applySelectedType(applyTerrain: (tt: TileType) => void, applyAsset: (at: AssetType) => void) {
    switch (this._state) {
      case State.terrainBrush: applyTerrain(this._terrainToBeDrawn); return;
      case State.assetBrush: applyAsset(this._assetToBeDrawn); return;

      default: break;
    }
  }
}

