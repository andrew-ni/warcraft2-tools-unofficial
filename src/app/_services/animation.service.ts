import { Injectable } from '@angular/core';
import { AssetType } from 'asset';
import { ipcRenderer } from 'electron';
import { Frame } from 'interfaces';

/**
 * AnimationService is the service that contains the frame data for each asset
 * (including units and structures).
 */
@Injectable()
export class AnimationService {
  private frames: Map<AssetType, Frame[]>;
}
