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

  private terrainCanvas: HTMLCanvasElement;
  private terrainContext: CanvasRenderingContext2D;

  private assetCanvas: HTMLCanvasElement;
  private assetContext: CanvasRenderingContext2D;

  private playerCanvas: HTMLCanvasElement;
  private playerContext: CanvasRenderingContext2D;

  private deltaToDirection: Map<string, string> = new Map([
    ['0,-1', 'n'],
    ['1,-1', 'ne'],
    ['1,0', 'e'],
    ['1,1', 'se'],
    ['0,1', 's'],
    ['-1,1', 'sw'],
    ['-1,0', 'w'],
    ['-1,-1', 'nw'],
    ['0,0', 'none']
  ]);

  private goldmine: AnimationContext;
  private farm: AnimationContext;
  private blacksmith: AnimationContext;
  private lumbermill: AnimationContext;
  private enemyKnight: AnimationContext;
  private enemyArcher: AnimationContext;
  private enemyRanger: AnimationContext;
  private player: AnimationContext;

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

    this.prepareInitialStates();

    this.drawAsset(this.goldmine);
    this.drawAsset(this.farm);
    this.drawAsset(this.blacksmith);
    this.drawAsset(this.lumbermill);
    this.drawAsset(this.enemyKnight);
    this.drawAsset(this.enemyArcher);
    this.drawAsset(this.enemyRanger);
  }

  private prepareInitialStates() {

    this.lumbermill.gridCoord = { x: 2, y: 11 };
    this.lumbermill.setAction('inactive');

    this.blacksmith.gridCoord = { x: 2, y: 8 };
    this.blacksmith.setAction('inactive');

    this.farm.gridCoord = { x: 3, y: 6 };
    this.farm.setAction('inactive');

    this.goldmine.gridCoord = { x: 2, y: 3 };
    this.goldmine.setAction('inactive');

    this.enemyKnight.coord = { x: 13 * 32 - 20, y: 3 * 32 - 25 };
    this.enemyKnight.setAction('walk');
    this.enemyKnight.setDirection('w');

    this.enemyArcher.coord = { x: 13 * 32 - 20, y: 8 * 32 - 25 };
    this.enemyArcher.setAction('walk');
    this.enemyArcher.setDirection('w');


    this.enemyRanger.coord = { x: 13 * 32 - 20, y: 13 * 32 - 25 };
    this.enemyRanger.setAction('walk');
    this.enemyRanger.setDirection('w');

  }

  public spawn(s: string) {
    if (this.player) { this.clearPlayer(); }
    console.log(AssetType[s]);
    this.player = new AnimationContext(this.spriteService.get(AssetType[s]));
    this.player.gridCoord = { x: 7, y: 7 };
    this.drawPlayer();

  }

  public moveStep(coord: Coordinate) {
    // 20 pixels hardcoded to account for offset inside spritesheet
    const source = { x: this.player.coord.x + 20, y: this.player.coord.y + 20 };
    const destX = coord.x;
    const destY = coord.y;
    const delta: Coordinate = { x: this.compare(source.x, destX), y: this.compare(source.y, destY) };
    const newLoc: Coordinate = { x: this.player.coord.x + delta.x * 32, y: this.player.coord.y + delta.y * 32 };

    this.player.setDirection(this.deltaToDirection.get(this.deltaToString(delta)));
    this.clearPlayer();
    this.player.coord = newLoc;
    this.drawPlayer();
  }

  /**
   * Comparison helper function. Should always take (source, dest), since assets starting at
   * the top left corner is assumed to be default behavior.
   * 32 is hardcoded as the "visual width" of a sprite.
   * @param source Source
   * @param dest Destination
   */
  private compare(source: number, dest: number): number {
    if (source > dest) { // less
      return -1;
    } else if ((source + 32) > dest) { // equal
      return 0;
    } else { // greater
      return 1;
    }
  }

  private deltaToString(c: Coordinate) {
    return '' + c.x + ',' + c.y;
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
 * @param terrainCanvas canvas element for drawing terrain
 * @param terrainContext context for terrain
 * @param assetCanvas canvas element for drawing assets
 * @param assetContext context for assets
 */
  public setCanvases(terrainCanvas: HTMLCanvasElement, terrainContext: CanvasRenderingContext2D, assetCanvas: HTMLCanvasElement, assetContext: CanvasRenderingContext2D, playerCanvas: HTMLCanvasElement, playerContext: CanvasRenderingContext2D): void {
    this.terrainCanvas = terrainCanvas;
    this.terrainContext = terrainContext;
    this.assetCanvas = assetCanvas;
    this.assetContext = assetContext;
    this.playerCanvas = playerCanvas;
    this.playerContext = playerContext;

    this.spriteService.initializing.then(() => this.init());
    const img = new Image();
    img.src = TestmapService.BACKGROUND_PATH;

    img.addEventListener('load', () => {
      this.terrainContext.drawImage(img, 0, 0);
    }, false);
  }

  // DRAW FUNCTIONS

  private clearAsset(context: AnimationContext) {
    const c: Coordinate = context.coord;
    let slice = context.sprite.image.width / 8;
    if (context === this.goldmine) { slice = context.sprite.image.width; }
    this.assetContext.clearRect(c.x, c.y, slice, slice);
  }

  private drawAsset(context: AnimationContext) {
    const c: Coordinate = context.coord;
    let slice = context.sprite.image.width / 8;
    if (context === this.goldmine) { slice = context.sprite.image.width; }
    this.assetContext.drawImage(
      context.sprite.image,
      0, slice * context.getCurFrame(), slice, slice,
      c.x, c.y, slice, slice);

    console.log('asset drawn');
  }

  private clearPlayer() {
    const c: Coordinate = this.player.coord;
    const slice = this.player.sprite.image.width / 8;
    this.playerContext.clearRect(c.x, c.y, slice, slice);
  }

  private drawPlayer() {
    const c: Coordinate = this.player.coord;
    const slice = this.player.sprite.image.width / 8;

    this.playerContext.drawImage(
      this.player.sprite.image,
      0, slice * this.player.getCurFrame(), slice, slice,
      c.x, c.y, slice, slice);

    console.log('player drawn');
  }


}
