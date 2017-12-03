import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-trigger-component',
  templateUrl: './trigger.component.html',
  styleUrls: ['./trigger.component.scss']
})
export class TriggerComponent implements OnInit {
  @Input() trigger: any;
  @Input() triggerIndex: number;
  subscriptArray: string[];
  constructor() { }
  ngOnInit() {
    this.subscriptArray = this.trigger[0].split(' ');
  }
}
