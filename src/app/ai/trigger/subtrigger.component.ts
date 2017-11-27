import { AfterContentChecked, Component, NgZone, OnInit } from '@angular/core';
import { MapService } from 'services/map.service';

enum SubscriptFormat {
  TRIGGER_TYPE, TRIGGERABLE_BY, REPEATABLE, EVENT, RESOURCE_TYPE, ASSET_TYPE, COMPARISON, AMOUNT, X_MIN, X_MAX, Y_MIN, Y_MAX, DELTA, PLAYER_WIN, PLAYER,
}

function getSelected(triggerIndex: number, subtriggerIndex: number, mapService: MapService) {
  return (mapService.triggers[triggerIndex].split(' '))[subtriggerIndex];
}

function changeSelected(triggerIndex: number, subtriggerIndex: number, selected: string, mapService: MapService, subtriggerFormat: SubscriptFormat) {
  const trigger = mapService.triggers[triggerIndex].split(' ');
  if (subtriggerFormat === SubscriptFormat.TRIGGER_TYPE) {
    const oldTriggerType = trigger[subtriggerIndex];
    if (oldTriggerType === '0') {
      trigger.splice(3, 3);
    } else if (oldTriggerType === '1') {
      trigger.splice(3, 3);
    } else if (oldTriggerType === '2') {
      trigger.splice(3, 5);
    }
    if (selected === '0') {
      trigger.splice(3, 0, 'x x x');
    } else if (selected === '1') {
      trigger.splice(3, 0, 'x x x');
    } else if (selected === '2') {
      trigger.splice(3, 0, 'x x x x x');
    }
    trigger[subtriggerIndex] = selected;
  } else if (subtriggerFormat === SubscriptFormat.EVENT) {
    let newEvent = '';
    const oldEvent = trigger[subtriggerIndex];
    if (selected === 'EndGame') {
      newEvent = 'EndGame x';
    } else if (selected === 'ResourceChange') {
      newEvent = 'ResourceChange x x';
    } else if (selected === 'RandAssetKill') {
      newEvent = 'RandAssetKill x x';
    } else if (selected === 'SpawnAsset') {
      newEvent = 'SpawnAsset x x x x x x';
    } else {
      newEvent = 'x';
    }
    if (oldEvent === 'EndGame') {
      trigger.splice(subtriggerIndex, 2, newEvent);
    } else if (oldEvent === 'ResourceChange') {
      trigger.splice(subtriggerIndex, 3, newEvent);
    } else if (oldEvent === 'RandAssetKill') {
      trigger.splice(subtriggerIndex, 3, newEvent);
    } else if (oldEvent === 'SpawnAsset') {
      trigger.splice(subtriggerIndex, 7, newEvent);
    } else {
      trigger.splice(subtriggerIndex, 1, newEvent);
    }
  } else {
    trigger[subtriggerIndex] = selected;
  }
  mapService.triggers[triggerIndex] = trigger.join(' ');
}

@Component({
  selector: 'app-st-trigger-type',
  template: `
    <select [ngModel]="selected" (ngModelChange)="onChange($event)">
      <option *ngFor="let subsubscript of [['trigger type', 'x'],
                                           ['resource', '0'],
                                           ['asset count', '1'],
                                           ['asset location', '2']]"
      [value]="subsubscript[1]">{{subsubscript[0]}}</option>
    </select>
  `,
  styleUrls: ['./subtrigger.component.scss']
})
export class StTriggerTypeComponent implements OnInit {
  selected: string;
  triggerIndex: number;
  subtriggerIndex: number;
  mapService: MapService;
  constructor() { }
  ngOnInit() {
    this.selected = getSelected(this.triggerIndex, this.subtriggerIndex, this.mapService);
  }
  onChange(newValue) {
    this.selected = newValue;
    changeSelected(this.triggerIndex, this.subtriggerIndex, this.selected, this.mapService, SubscriptFormat.TRIGGER_TYPE);
  }
}

@Component({
  selector: 'app-st-triggerable-by',
  template: `
    <select [ngModel]="selected" (ngModelChange)="onChange($event)">
      <option *ngFor="let subsubscript of [['triggerable by', 'x'],
                                           ['both', '0'],
                                           ['player', '1'],
                                           ['ai', '2']]"
      [value]="subsubscript[1]">{{subsubscript[0]}}</option>
    </select>
  `,
  styleUrls: ['./subtrigger.component.scss']
})
export class StTriggerableByComponent implements OnInit {
  selected: string;
  triggerIndex: number;
  subtriggerIndex: number;
  mapService: MapService;
  constructor() { }
  ngOnInit() {
    this.selected = getSelected(this.triggerIndex, this.subtriggerIndex, this.mapService);
  }
  onChange(newValue) {
    this.selected = newValue;
    changeSelected(this.triggerIndex, this.subtriggerIndex, this.selected, this.mapService, SubscriptFormat.TRIGGERABLE_BY);
  }
}

@Component({
  selector: 'app-st-repeatable',
  template: `
    <select [ngModel]="selected" (ngModelChange)="onChange($event)">
      <option *ngFor="let subsubscript of [['repeatable', 'x'],
                                           ['no', '0'],
                                           ['yes', '1']]"
      [value]="subsubscript[1]">{{subsubscript[0]}}</option>
    </select>
  `,
  styleUrls: ['./subtrigger.component.scss']
})
export class StRepeatableComponent implements OnInit {
  selected: string;
  triggerIndex: number;
  subtriggerIndex: number;
  mapService: MapService;
  constructor() { }
  ngOnInit() {
    this.selected = getSelected(this.triggerIndex, this.subtriggerIndex, this.mapService);
  }
  onChange(newValue) {
    this.selected = newValue;
    changeSelected(this.triggerIndex, this.subtriggerIndex, this.selected, this.mapService, SubscriptFormat.REPEATABLE);
  }
}

@Component({
  selector: 'app-st-event',
  template: `
    <select [ngModel]="selected" (ngModelChange)="onChange($event)">
      <option *ngFor="let subsubscript of [['event', 'x'],
                                           ['end game', 'EndGame'],
                                           ['resource change', 'ResourceChange'],
                                           ['random asset kill', 'RandAssetKill'],
                                           ['spawn asset', 'SpawnAsset']]"
      [value]="subsubscript[1]">{{subsubscript[0]}}</option>
    </select>
  `,
  styleUrls: ['./subtrigger.component.scss']
})
export class StEventComponent implements OnInit {
  selected: string;
  triggerIndex: number;
  subtriggerIndex: number;
  mapService: MapService;
  constructor() { }
  ngOnInit() {
    this.selected = getSelected(this.triggerIndex, this.subtriggerIndex, this.mapService);
  }
  onChange(newValue) {
    this.selected = newValue;
    changeSelected(this.triggerIndex, this.subtriggerIndex, this.selected, this.mapService, SubscriptFormat.EVENT);
  }
}

@Component({
  selector: 'app-st-resource-type',
  template: `
    <select [ngModel]="selected" (ngModelChange)="onChange($event)">
      <option *ngFor="let subsubscript of [['resource type', 'x'],
                                           ['Gold', 'Gold'],
                                           ['Lumber', 'Lumber'],
                                           ['Stone', 'Stone']]"
      [value]="subsubscript[1]">{{subsubscript[0]}}</option>
    </select>
  `,
  styleUrls: ['./subtrigger.component.scss']
})
export class StResourceTypeComponent implements OnInit {
  selected: string;
  triggerIndex: number;
  subtriggerIndex: number;
  mapService: MapService;
  constructor() { }
  ngOnInit() {
    this.selected = getSelected(this.triggerIndex, this.subtriggerIndex, this.mapService);
  }
  onChange(newValue) {
    this.selected = newValue;
    changeSelected(this.triggerIndex, this.subtriggerIndex, this.selected, this.mapService, SubscriptFormat.RESOURCE_TYPE);
  }
}

@Component({
  selector: 'app-st-asset-type',
  template: `
    <select [ngModel]="selected" (ngModelChange)="onChange($event)">
      <option *ngFor="let subsubscript of [['asset type', 'x'],
                                           ['Peasants', 'Peasants'],
                                           ['Footmen', 'Footmen'],
                                           ['Archers', 'Archers']]"
      [value]="subsubscript[1]">{{subsubscript[0]}}</option>
    </select>
  `,
  styleUrls: ['./subtrigger.component.scss']
})
export class StAssetTypeComponent implements OnInit {
  selected: string;
  triggerIndex: number;
  subtriggerIndex: number;
  mapService: MapService;
  constructor() { }
  ngOnInit() {
    this.selected = getSelected(this.triggerIndex, this.subtriggerIndex, this.mapService);
  }
  onChange(newValue) {
    this.selected = newValue;
    changeSelected(this.triggerIndex, this.subtriggerIndex, this.selected, this.mapService, SubscriptFormat.ASSET_TYPE);
  }
}

@Component({
  selector: 'app-st-comparison',
  template: `
    <select [ngModel]="selected" (ngModelChange)="onChange($event)">
      <option *ngFor="let subsubscript of [['comparison', 'x'],
                                           ['<', '<'],
                                           ['>', '>']]"
      [value]="subsubscript[1]">{{subsubscript[0]}}</option>
    </select>
  `,
  styleUrls: ['./subtrigger.component.scss']
})
export class StComparisonComponent implements OnInit {
  selected: string;
  triggerIndex: number;
  subtriggerIndex: number;
  mapService: MapService;
  constructor() { }
  ngOnInit() {
    this.selected = getSelected(this.triggerIndex, this.subtriggerIndex, this.mapService);
  }
  onChange(newValue) {
    this.selected = newValue;
    changeSelected(this.triggerIndex, this.subtriggerIndex, this.selected, this.mapService, SubscriptFormat.COMPARISON);
  }
}

@Component({
  selector: 'app-st-amount',
  template: `
    <input type="number" min="0" placeholder="amount" [ngModel]="getSelected()" (ngModelChange)="onChange($event)">
  `,
  styleUrls: ['./subtrigger.component.scss']
})
export class StAmountComponent implements OnInit {
  selected: string;
  triggerIndex: number;
  subtriggerIndex: number;
  mapService: MapService;
  constructor() { }
  ngOnInit() {
    this.selected = getSelected(this.triggerIndex, this.subtriggerIndex, this.mapService);
  }
  getSelected() {
    if (this.selected === 'x') {
      return NaN;
    } else {
      return this.selected;
    }
  }
  onChange(newValue) {
    if (newValue === null) {
      this.selected = 'x';
    } else {
      this.selected = newValue.toString();
    }
    changeSelected(this.triggerIndex, this.subtriggerIndex, this.selected, this.mapService, SubscriptFormat.AMOUNT);
  }
}

@Component({
  selector: 'app-st-x-min',
  template: `
    <input type="number" min="0" placeholder="x min" [ngModel]="getSelected()" (ngModelChange)="onChange($event)">
  `,
  styleUrls: ['./subtrigger.component.scss']
})
export class StXMinComponent implements OnInit {
  selected: string;
  triggerIndex: number;
  subtriggerIndex: number;
  mapService: MapService;
  constructor() { }
  ngOnInit() {
    this.selected = getSelected(this.triggerIndex, this.subtriggerIndex, this.mapService);
  }
  getSelected() {
    if (this.selected === 'x') {
      return NaN;
    } else {
      return this.selected;
    }
  }
  onChange(newValue) {
    if (newValue === null) {
      this.selected = 'x';
    } else {
      this.selected = newValue.toString();
    }
    changeSelected(this.triggerIndex, this.subtriggerIndex, this.selected, this.mapService, SubscriptFormat.X_MIN);
  }
}

@Component({
  selector: 'app-st-x-max',
  template: `
    <input type="number" min="0" placeholder="x max" [ngModel]="getSelected()" (ngModelChange)="onChange($event)">
  `,
  styleUrls: ['./subtrigger.component.scss']
})
export class StXMaxComponent implements OnInit {
  selected: string;
  triggerIndex: number;
  subtriggerIndex: number;
  mapService: MapService;
  constructor() { }
  ngOnInit() {
    this.selected = getSelected(this.triggerIndex, this.subtriggerIndex, this.mapService);
  }
  getSelected() {
    if (this.selected === 'x') {
      return NaN;
    } else {
      return this.selected;
    }
  }
  onChange(newValue) {
    if (newValue === null) {
      this.selected = 'x';
    } else {
      this.selected = newValue.toString();
    }
    changeSelected(this.triggerIndex, this.subtriggerIndex, this.selected, this.mapService, SubscriptFormat.X_MAX);
  }
}

@Component({
  selector: 'app-st-y-min',
  template: `
    <input type="number" min="0" placeholder="y min" [ngModel]="getSelected()" (ngModelChange)="onChange($event)">
  `,
  styleUrls: ['./subtrigger.component.scss']
})
export class StYMinComponent implements OnInit {
  selected: string;
  triggerIndex: number;
  subtriggerIndex: number;
  mapService: MapService;
  constructor() { }
  ngOnInit() {
    this.selected = getSelected(this.triggerIndex, this.subtriggerIndex, this.mapService);
  }
  getSelected() {
    if (this.selected === 'x') {
      return NaN;
    } else {
      return this.selected;
    }
  }
  onChange(newValue) {
    if (newValue === null) {
      this.selected = 'x';
    } else {
      this.selected = newValue.toString();
    }
    changeSelected(this.triggerIndex, this.subtriggerIndex, this.selected, this.mapService, SubscriptFormat.Y_MIN);
  }
}

@Component({
  selector: 'app-st-y-max',
  template: `
    <input type="number" min="0" placeholder="y max" [ngModel]="getSelected()" (ngModelChange)="onChange($event)">
  `,
  styleUrls: ['./subtrigger.component.scss']
})
export class StYMaxComponent implements OnInit {
  selected: string;
  triggerIndex: number;
  subtriggerIndex: number;
  mapService: MapService;
  constructor() { }
  ngOnInit() {
    this.selected = getSelected(this.triggerIndex, this.subtriggerIndex, this.mapService);
  }
  getSelected() {
    if (this.selected === 'x') {
      return NaN;
    } else {
      return this.selected;
    }
  }
  onChange(newValue) {
    if (newValue === null) {
      this.selected = 'x';
    } else {
      this.selected = newValue.toString();
    }
    changeSelected(this.triggerIndex, this.subtriggerIndex, this.selected, this.mapService, SubscriptFormat.Y_MAX);
  }
}

@Component({
  selector: 'app-st-delta',
  template: `
    <input type="number" min="0" placeholder="delta" [ngModel]="getSelected()" (ngModelChange)="onChange($event)">
  `,
  styleUrls: ['./subtrigger.component.scss']
})
export class StDeltaComponent implements OnInit {
  selected: string;
  triggerIndex: number;
  subtriggerIndex: number;
  mapService: MapService;
  constructor() { }
  ngOnInit() {
    this.selected = getSelected(this.triggerIndex, this.subtriggerIndex, this.mapService);
  }
  getSelected() {
    if (this.selected === 'x') {
      return NaN;
    } else {
      return this.selected;
    }
  }
  onChange(newValue) {
    if (newValue === null) {
      this.selected = 'x';
    } else {
      this.selected = newValue.toString();
    }
    changeSelected(this.triggerIndex, this.subtriggerIndex, this.selected, this.mapService, SubscriptFormat.DELTA);
  }
}

@Component({
  selector: 'app-st-player-win',
  template: `
    <select [ngModel]="selected" (ngModelChange)="onChange($event)">
      <option *ngFor="let subsubscript of getOptions()"
      [value]="subsubscript[1]">{{subsubscript[0]}}</option>
    </select>
  `,
  styleUrls: ['./subtrigger.component.scss']
})
export class StPlayerWinComponent implements OnInit, AfterContentChecked {
  selected: string;
  triggerIndex: number;
  subtriggerIndex: number;
  mapService: MapService;
  constructor() { }
  ngOnInit() {
    this.selected = getSelected(this.triggerIndex, this.subtriggerIndex, this.mapService);
  }
  ngAfterContentChecked() {
    if (Number(this.selected) >= Number(this.mapService.players.length - 1)) {
      this.onChange('x');
    }
  }
  onChange(newValue) {
    this.selected = newValue;
    changeSelected(this.triggerIndex, this.subtriggerIndex, this.selected, this.mapService, SubscriptFormat.PLAYER_WIN);
  }
  getOptions() {
    const options = [['player win', 'x']];
    for (let i = 0; i < this.mapService.players.length - 1; ++i) {
      options.push([(i + 1).toString(), i.toString()]);
    }
    return options;
  }
}

@Component({
  selector: 'app-st-player',
  template: `
    <select [ngModel]="selected" (ngModelChange)="onChange($event)">
      <option *ngFor="let subsubscript of getOptions()"
      [value]="subsubscript[1]">{{subsubscript[0]}}</option>
    </select>
  `,
  styleUrls: ['./subtrigger.component.scss']
})
export class StPlayerComponent implements OnInit, AfterContentChecked {
  selected: string;
  triggerIndex: number;
  subtriggerIndex: number;
  mapService: MapService;
  constructor() { }
  ngOnInit() {
    this.selected = getSelected(this.triggerIndex, this.subtriggerIndex, this.mapService);
  }
  ngAfterContentChecked() {
    if (Number(this.selected) >= Number(this.mapService.players.length - 1)) {
      this.onChange('x');
    }
  }
  onChange(newValue) {
    this.selected = newValue;
    changeSelected(this.triggerIndex, this.subtriggerIndex, this.selected, this.mapService, SubscriptFormat.PLAYER);
  }
  getOptions() {
    const options = [['player', 'x']];
    for (let i = 0; i < this.mapService.players.length - 1; ++i) {
      options.push([(i + 1).toString(), i.toString()]);
    }
    return options;
  }
}
