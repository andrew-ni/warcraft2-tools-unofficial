import { Injectable } from '@angular/core';
import { AssetType, neutralAssets } from 'asset';
import { Coordinate } from 'interfaces';
import { SpriteService } from 'services/sprite.service';
import { AnimationContext } from 'sprite';

import * as fs from 'fs';
import { join as pathJoin } from 'path';

@Injectable()
export class TestmapService {
  public static readonly BACKGROUND_PATH = './data/testmap.png';
  public static readonly ANIMATION_DELAY = 250;

  private bottomCanvas: HTMLCanvasElement;
  private bottomContext: CanvasRenderingContext2D;

  private topCanvas: HTMLCanvasElement;
  private topContext: CanvasRenderingContext2D;

  private goldmine: AnimationContext;
  private farm: AnimationContext;
  private blacksmith: AnimationContext;
  private lumbermill: AnimationContext;
  private enemyKnight: AnimationContext;
  private enemyArcher: AnimationContext;
  private enemyRanger: AnimationContext;
  private current: AnimationContext;

  private backgroundImage: ImageBitmap;

  constructor(
    private spriteService: SpriteService,
  ) { }

  public init() {
    this.goldmine = new AnimationContext(this.spriteService.get(AssetType.GoldMine));
    this.farm = new AnimationContext(this.spriteService.get(AssetType.Farm));
    this.blacksmith = new AnimationContext(this.spriteService.get(AssetType.Blacksmith));
    this.lumbermill = new AnimationContext(this.spriteService.get(AssetType.LumberMill));
    this.enemyKnight = new AnimationContext(this.spriteService.get(AssetType.Footman));
    this.enemyArcher = new AnimationContext(this.spriteService.get(AssetType.Archer));
    this.enemyRanger = new AnimationContext(this.spriteService.get(AssetType.Ranger));

    // const f: File = new File([''], TestmapService.BACKGROUND_PATH);
    // console.log(f.path);
    // this.backgroundImage = await createImageBitmap(new File([''], TestmapService.BACKGROUND_PATH));
  }

  /**
   * Plays audio for current animation using string mappings to audio service.
   * @param optional Optional string from click handlers. Needed to trigger action-less animations (e.g. 'selected').
   */
  private getAudio(optional?: string) {
    // Existing: walk, attack, gold, lumber, death
    const peasantMap: Map<string, string[]> = new Map([
      ['selected', ['peasant-selected1', 'peasant-selected2', 'peasant-selected3', 'peasant-selected4']],
      ['walk', ['peasant-acknowledge1', 'peasant-acknowledge2', 'peasant-acknowledge3', 'peasant-acknowledge4']],
      ['attack', ['melee-hit1', 'melee-hit2', 'melee-hit3']],
      ['lumber', ['harvest1', 'harvest2', 'harvest3', 'harvest4']],
      ['death', ['unit-death']],
      ['spawn', ['peasant-ready']],
      ['workdone', ['peasant-work-completed']],
      ['annoy', ['peasant-annoyed1', 'peasant-annoyed2', 'peasant-annoyed3', 'peasant-annoyed4', 'peasant-annoyed5', 'peasant-annoyed6', 'peasant-annoyed7']],
      ['help', ['unit-help']],
    ]);
    // Existing: walk, attack, death
    const footmanMap: Map<string, string[]> = new Map([
      ['selected', ['basic-selected1', 'basic-selected2', 'basic-selected3', 'basic-selected4', 'basic-selected5', 'basic-selected6']],
      ['walk', ['basic-acknowledge1', 'basic-acknowledge2', 'basic-acknowledge3', 'basic-acknowledge4']],
      ['attack', ['melee-hit1', 'melee-hit2', 'melee-hit3']],
      ['death', ['unit-death']],
      ['spawn', ['basic-ready']],
      ['workdone', ['basic-work-completed']],
      ['annoy', ['basic-annoyed1', 'basic-annoyed2', 'basic-annoyed3', 'basic-annoyed4', 'basic-annoyed5', 'basic-annoyed6', 'basic-annoyed7']],
      ['help', ['unit-help']],
    ]);
    // Existing: walk, attack, death
    const archerRangerMap: Map<string, string[]> = new Map([
      ['selected', ['archer-selected1', 'archer-selected2', 'archer-selected3', 'archer-selected4']],
      ['walk', ['archer-acknowledge1', 'archer-acknowledge2', 'archer-acknowledge3', 'archer-acknowledge4']],
      ['attack', ['bowfire', 'bowhit']],
      ['death', ['unit-death']],
      ['spawn', ['archer-ready']],
      ['annoy', ['archer-annoyed1', 'archer-annoyed2', 'archer-annoyed3']],
      ['help', ['unit-help']],
    ]);
    // Existing: inactive, active
    const goldmineMap: Map<string, string[]> = new Map([
      ['selected', ['gold-mine-selected']],
      ['place', ['place']],
      ['death', ['building-death1', 'building-death2', 'building-death3']],
      ['help', ['building-help']],
      ['construct', ['construct']],
    ]);
    // Existing: construct, inactive, place
    const lumbermillMap: Map<string, string[]> = new Map([
      ['selected', ['lumber-mill-selected']],
      ['place', ['place']],
      ['death', ['building-death1', 'building-death2', 'building-death3']],
      ['help', ['building-help']],
      ['construct', ['construct']],
    ]);
    // Existing: construct, inactive, place
    const farmMap: Map<string, string[]> = new Map([
      ['selected', ['farm-selected']],
      ['place', ['place']],
      ['death', ['building-death1', 'building-death2', 'building-death3']],
      ['help', ['building-help']],
      ['construct', ['construct']],
    ]);
    // Existing: construct, inactive, place
    const blacksmithMap: Map<string, string[]> = new Map([
      ['selected', ['blacksmith-selected']],
      ['place', ['place']],
      ['death', ['building-death1', 'building-death2', 'building-death3']],
      ['help', ['building-help']],
      ['construct', ['construct']],
    ]);
    const miscMap: Map<string, string[]> = new Map([
      ['bowhit', ['bowhit']],
      ['cannonfire', ['cannonfire']],
      ['cannonhit', ['cannonhit']],
      ['burning', ['burning']],
      ['tick', ['tick']],
      ['tock', ['tock']],
    ]);

  }

  /**
 * Sets canvas and context elements, initializing this TestMap.
 * @param bCanvas canvas element for drawing terrain
 * @param bCtx context for terrain
 * @param tCanvas canvas element for drawing assets
 * @param tCtx context for assets
 */
  public setCanvases(bCanvas: HTMLCanvasElement, bCtx: CanvasRenderingContext2D, tCanvas: HTMLCanvasElement, tCtx: CanvasRenderingContext2D): void {
    this.bottomCanvas = bCanvas;
    this.bottomContext = bCtx;
    this.topCanvas = tCanvas;
    this.topContext = tCtx;

    this.spriteService.initializing.then(() => this.init());
    const img = new Image();
    img.src = TestmapService.BACKGROUND_PATH;

    img.addEventListener('load', () => {
      this.bottomContext.drawImage(img, 0, 0);
    }, false);
  }

  private clear(context: AnimationContext) {
    const c: Coordinate = context.coord;
    const slice = context.sprite.image.width / 8;
    this.topContext.clearRect(c.x, c.y, slice, slice);
  }

  private draw(context: AnimationContext) {
    const c: Coordinate = context.coord;
    const slice = context.sprite.image.width / 8;
    this.topContext.drawImage(
      context.sprite.image,
      0, 0, slice, slice,
      c.x, c.y, slice, slice * (context.getCurFrame() + 1));
  }


}
