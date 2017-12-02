import { Injectable } from '@angular/core';
import { AssetType, neutralAssets } from 'asset';
import { Coordinate } from 'interfaces';
import { SpriteService } from 'services/sprite.service';
import { AnimationContext } from 'sprite';

import * as fs from 'fs';
import { join as pathJoin } from 'path';
import { AnimationService } from 'services/animation.service';
import { MapService } from 'services/map.service';

enum Action {
  Forest,
  GoldMine,
  Farm,
  BlackSmith,
  LumberMill,
  EnemyKnight,
  EnemyArcher,
  EnemyRanger,
  Grass,
}

@Injectable()
export class TestmapService {
  public static readonly BACKGROUND_PATH = './data/testmap.png';

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


  private actionLayer: Action[][];

  private goldmine: AnimationContext;
  private farm: AnimationContext;
  private blacksmith: AnimationContext;
  private lumbermill: AnimationContext;
  private enemyKnight: AnimationContext;
  private enemyArcher: AnimationContext;
  private enemyRanger: AnimationContext;
  private player: AnimationContext;
  private playerAsset: AssetType;

  private backgroundImage: ImageBitmap;

  private moveInterval: NodeJS.Timer = undefined;
  private currentAction: Action = undefined;
  private frameInterval: NodeJS.Timer = undefined;
  private stationaryInterval: NodeJS.Timer = undefined;

  private delta: Coordinate = { x: 0, y: 0 };
  private dest: Coordinate = { x: 0, y: 0 };
  private movementDuration = 0;

  constructor(
    private spriteService: SpriteService,
  ) {


  }

  public init() {
    // initialize 16x16 action layer
    this.actionLayer = [];
    this.actionLayer.length = 16;

    for (let y = 0; y < this.actionLayer.length; y++) {
      this.actionLayer[y] = [];
      this.actionLayer[y].length = 16;
    }

    // initialize Animation contexts
    this.goldmine = new AnimationContext(this.spriteService.get(AssetType.GoldMine));
    this.farm = new AnimationContext(this.spriteService.get(AssetType.Farm));
    this.blacksmith = new AnimationContext(this.spriteService.get(AssetType.Blacksmith));
    this.lumbermill = new AnimationContext(this.spriteService.get(AssetType.LumberMill));
    this.enemyKnight = new AnimationContext(this.spriteService.get(AssetType.Footman));
    this.enemyArcher = new AnimationContext(this.spriteService.get(AssetType.Archer));
    this.enemyRanger = new AnimationContext(this.spriteService.get(AssetType.Ranger));

    this.prepareInitialStates();

    this.addAssetToActionLayer(this.goldmine);
    this.addAssetToActionLayer(this.farm);
    this.addAssetToActionLayer(this.blacksmith);
    this.addAssetToActionLayer(this.lumbermill);
    this.addAssetToActionLayer(this.enemyKnight);
    this.addAssetToActionLayer(this.enemyArcher);
    this.addAssetToActionLayer(this.enemyRanger);

    this.addDefaultRegions();

    this.drawAsset(this.goldmine);
    this.drawAsset(this.farm);
    this.drawAsset(this.blacksmith);
    this.drawAsset(this.lumbermill);
    this.drawAsset(this.enemyKnight);
    this.drawAsset(this.enemyArcher);
    this.drawAsset(this.enemyRanger);

    this.spawn('Peasant');
    this.drawPlayer();
  }

  /** Adds Forest and Grass Action enums to action layer. */
  private addDefaultRegions() {
    let x, y;
    for (x = 5; x <= 12; x++) {
      this.actionLayer[x][14] = Action.Forest;
      this.actionLayer[x][15] = Action.Forest;
      this.actionLayer[x][0] = Action.Forest;
      this.actionLayer[x][1] = Action.Forest;
      this.actionLayer[x][2] = Action.Forest;
    }

    for (y = 4; y <= 12; y++) {
      if (this.actionLayer[13][y] === undefined) {
        this.actionLayer[13][y] = Action.Forest;
        this.actionLayer[14][y] = Action.Forest;
        this.actionLayer[15][y] = Action.Forest;
      }
    }

    for (x = 5; x <= 12; x++) {
      for (y = 3; y <= 13; y++) {
        this.actionLayer[x][y] = Action.Grass;
      }
    }
  }

  /** Adds corresponding action enum to action layer, based on given context. */
  private addAssetToActionLayer(a: AnimationContext) {
    const x: number = a.gridCoord.x;
    const y: number = a.gridCoord.y;
    let width: number = a.sprite.image.width / MapService.MAX_PLAYERS / MapService.TERRAIN_SIZE;

    let action: Action;
    switch (a) {
      case this.goldmine: {
        action = Action.GoldMine;
        width = a.sprite.image.width / MapService.TERRAIN_SIZE;
        break;
      }
      case this.farm: {
        action = Action.Farm;
        break;
      }
      case this.blacksmith: {
        action = Action.BlackSmith;
        break;
      }
      case this.lumbermill: {
        action = Action.LumberMill;
        break;
      }
      case this.enemyKnight: {
        action = Action.EnemyKnight;
        width = 1;
        break;
      }
      case this.enemyArcher: {
        action = Action.EnemyArcher;
        width = 1;
        break;
      }
      case this.enemyRanger: {
        action = Action.EnemyRanger;
        width = 1;
        break;
      }
      default: {
        // statements;
        break;
      }
    }

    for (let n = x; n < x + width; n++) {
      for (let m = y; m < y + width; m++) {
        this.actionLayer[n][m] = action;
      }
    }
  }

  /** Declare initial locations and animation states. */
  private prepareInitialStates() {

    this.lumbermill.gridCoord = { x: 2, y: 11 };
    this.lumbermill.setAction('inactive');

    this.blacksmith.gridCoord = { x: 2, y: 8 };
    this.blacksmith.setAction('inactive');

    this.farm.gridCoord = { x: 3, y: 6 };
    this.farm.setAction('inactive');

    this.goldmine.gridCoord = { x: 2, y: 3 };
    this.goldmine.setAction('inactive');

    this.enemyKnight.gridCoord = { x: 13, y: 3 };
    this.enemyKnight.setAction('walk');
    this.enemyKnight.setDirection('w');

    this.enemyArcher.gridCoord = { x: 13, y: 8 };
    this.enemyArcher.setAction('walk');
    this.enemyArcher.setDirection('w');


    this.enemyRanger.gridCoord = { x: 13, y: 13 };
    this.enemyRanger.setAction('walk');
    this.enemyRanger.setDirection('w');
  }

  /**
   * Entry function called from click handlers.
   * Handles bounding, detects action to perform (based on clicked region),
   * then calls another function to move.
   * @param c Click coordinates.
   */
  public click(c: Coordinate) {
    if (this.player) {
      const action: Action = this.actionLayer[Math.floor(c.x / 32)][Math.floor(c.y / 32)];

      if (this.stationaryInterval !== undefined) {
        this.currentAction = undefined;
        clearInterval(this.stationaryInterval);
        this.stationaryInterval = undefined;
        this.player.setAction('walk', true);
      }

      if (action !== undefined) {
        if (Math.floor(c.x / 32) < 5) {
          c.x = 5 * 32;
        } else if (Math.floor(c.x / 32) > 12) {
          c.x = 12 * 32;
        }

        if (Math.floor(c.y / 32) < 3) {
          c.y = 3 * 32;
        } else if (Math.floor(c.y / 32) > 13) {
          c.y = 13 * 32;
        }

        this.moveTo(c);
        this.currentAction = action;
      }
    }
  }

  /**
   * Called from html buttons to spawn an asset.
   * @param s Name of asset to spawn.
   */
  public spawn(s: string) {
    if (this.player) { this.clearPlayer(); }
    this.playerAsset = AssetType[s];
    this.player = new AnimationContext(this.spriteService.get(AssetType[s]));
    this.player.gridCoord = { x: 7, y: 7 };
    // this.drawPlayer();

  }

  /** Plays the death animation. */
  public despawn() {
    if (this.player) {
      this.player.setAction('death');
      let deathInterval: NodeJS.Timer;
      let i = 0;
      const deathStep = () => {
        if (i === 3) { this.clearPlayer(); this.player = undefined; clearInterval(deathInterval); return; }
        this.clearPlayer();
        this.drawPlayer();
        this.player.nextFrame();
        i++;
      };
      deathInterval = setInterval(deathStep, AnimationService.ANIMATION_DELAY);
      // this.clearPlayer();
    }
  }

  /**
   * Sets intervals for moveStep and nextFrame.
   * @param dest Destination coordinates.
   */
  private moveTo(dest: Coordinate) {
    if (this.movementDuration === 0) {
      this.dest = dest;
      const source = { x: this.player.coord.x, y: this.player.coord.y };
      this.delta = { x: this.compare(source.x, dest.x), y: this.compare(source.y, dest.y) };
      const direction: string = this.deltaToDirection.get(this.deltaToString(this.delta));
      this.movementDuration = Math.floor(Math.max(Math.abs(source.x - dest.x), Math.abs(source.y - dest.y)) / 32) * 32;
      if (direction === 'none') {
        this.movementDuration = 0;
        return;
      }
      this.player.setDirection(direction);
    }
  }

  /**
   * Called once per interval set in moveTo.
   * Calculates direction for each movement step and moves the player one tile (32 pixels).
   * Also creates intervals for animStep, for smoother movement.
   * @param dest Destination coordinates.
   */
  private moveStep(dest: Coordinate) {

    /*
     * End of pathfinding. Clear intervals for frame and move.
     */
    // if (direction === 'none') {   // we have finished pathfinding
    //   clearInterval(this.moveInterval);
    //   this.moveInterval = undefined;
    //   clearInterval(this.frameInterval);
    //   this.frameInterval = undefined;

    //   this.clearPlayer();
    //   this.player.resetFrame();
    //   this.drawPlayer();
    //   this.performAction();

    //   return;
    // }

    //
    // let animStepNum = 0;
    // let animInterval: NodeJS.Timer;

    // const animStep = () => {
    //   if (++animStepNum > MapService.TERRAIN_SIZE) {
    //     clearInterval(animInterval);
    //     animInterval = undefined;
    //     animStepNum = 0;
    //     console.log('animation stopped');
    //     return;
    //   }


    //   this.drawPlayer();
    // };

    // animInterval = setInterval(animStep, AnimationService.ANIMATION_DELAY / 32);
  }

  /**
   * Decides what animation Actions to play (lumber, attack, death, etc).
   */
  private performAction() {
    switch (this.currentAction) {
      case Action.Forest: {
        if (this.playerAsset === AssetType.Peasant) {
          console.log('chop wood for 3 cycles');
          this.player.setAction('attack', true);
        }

        break;
      }

      case Action.EnemyArcher: {
        console.log('attack archer for 3 cycles');
        this.player.setAction('attack', true);

        break;
      }

      case Action.EnemyKnight: {
        console.log('attack knight for 3 cycles');
        this.player.setAction('attack', true);

        break;
      }

      case Action.EnemyRanger: {
        console.log('attack ranger for 3 cycles');
        this.player.setAction('attack', true);

        break;
      }

      case Action.Grass: {
        return;
      }

      default: {
        return;
      }
    }

    let cycles = 0;

    const stationaryAction = () => {
      if (this.player.frameNum === 0) {
        cycles++;
      }

      if (cycles === 4) {
        clearInterval(this.stationaryInterval);
        this.stationaryInterval = undefined;
        this.player.setAction('walk', true);
        this.currentAction = undefined;
        return;
      }
      this.player.nextFrame();
    };

    this.stationaryInterval = setInterval(stationaryAction, AnimationService.ANIMATION_DELAY);
  }

  /**
   * Comparison helper function. Should always take (source, dest), since assets starting at
   * the top left corner is assumed to be default behavior.
   * MapService.TERRAIN_SIZE is hardcoded as the "visual width" of a sprite.
   * @param source Source
   * @param dest Destination
   */
  private compare(source: number, dest: number): number {
    if (source > dest) { // less
      return -1;
    } else if ((source + MapService.TERRAIN_SIZE) > dest) { // equal
      return 0;
    } else { // greater
      return 1;
    }
  }

  /** Helper function for mapping key workaround. */
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


  /**
   * Clears an asset on canvas.
   * @param context Animation context to clear.
   */
  private clearAsset(context: AnimationContext) {
    const c: Coordinate = context.coord;
    let slice = context.sprite.image.width / MapService.MAX_PLAYERS;

    let offset = 0;

    if (slice % MapService.TERRAIN_SIZE !== 0) {
      offset = (slice - MapService.TERRAIN_SIZE) / 2;
    }
    if (context === this.goldmine) { slice = context.sprite.image.width; }
    this.assetContext.clearRect(c.x - offset, c.y - offset, slice, slice);
  }

  /**
   * Draws asset on canvas. Contains logic for visual offsets of foot units.
   * @param context Animation context to draw.
   */
  private drawAsset(context: AnimationContext) {
    const c: Coordinate = context.coord;
    const img = context.sprite.image;

    let slice = context.sprite.image.width / MapService.MAX_PLAYERS;

    if (context === this.goldmine) { slice = context.sprite.image.width; }

    let offset = 0;

    if (slice % MapService.TERRAIN_SIZE !== 0) {
      offset = (slice - MapService.TERRAIN_SIZE) / 2;
    }

    console.log(offset);

    this.assetContext.drawImage(
      img,
      0, slice * context.getCurFrame(), slice, slice,
      c.x - offset, c.y - offset, slice, slice);
  }

  /**
   * Clears player's asset from canvas.
   */
  private clearPlayer() {
    if (this.player) {
      const c: Coordinate = this.player.coord;
      const slice = this.player.sprite.image.width / MapService.MAX_PLAYERS;

      let offset = 0;

      if (slice % MapService.TERRAIN_SIZE !== 0) {
        offset = (slice - MapService.TERRAIN_SIZE) / 2;
      }

      this.playerContext.clearRect(c.x - offset, c.y - offset, slice, slice);
    }
  }

  /**
   * Draws player's asset on canvas.
   */
  private drawPlayer() {
    if (this.player) {
      this.clearPlayer();

      console.log('frame');

      if (this.movementDuration > 0) {
        if (this.movementDuration % 32 === 0) {
          const source = { x: this.player.coord.x, y: this.player.coord.y };
          this.delta = { x: this.compare(source.x, this.dest.x), y: this.compare(source.y, this.dest.y) };
          const direction: string = this.deltaToDirection.get(this.deltaToString(this.delta));
          if (direction === 'none') {
            this.movementDuration = 0;
            return;
          }
          this.player.setDirection(direction);
        }
        if (this.movementDuration % 5 === 0) this.player.nextFrame();
        this.player.coord.x += this.delta.x; // change pixels for drawPlayer
        this.player.coord.y += this.delta.y;
        this.movementDuration--;

        if (this.movementDuration === 0) {
          this.performAction();
        }

      }

      const c: Coordinate = this.player.coord;
      const slice = this.player.sprite.image.width / MapService.MAX_PLAYERS;

      let offset = 0;

      if (slice % MapService.TERRAIN_SIZE !== 0) {
        offset = (slice - MapService.TERRAIN_SIZE) / 2;
      }

      this.playerContext.drawImage(
        this.player.sprite.image,
        0, slice * this.player.getCurFrame(), slice, slice,
        c.x - offset, c.y - offset, slice, slice);
    }
    setTimeout(() => this.drawPlayer(), 1000 / 60);
  }
}
