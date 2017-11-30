import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-trigger-component',
  templateUrl: './trigger.component.html',
  styleUrls: ['./trigger.component.scss']
})
export class TriggerComponent implements OnInit {
  @Input() trigger: any;
  @Input() triggerIndex: number;
  getSubscriptArray = TriggerComponent.getSubscriptArray;
  static getSubscriptArray(script: string) {
    return script.split(' ');
  }
  constructor() { }
  ngOnInit() { }
}
