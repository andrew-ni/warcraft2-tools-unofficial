import { Component, ComponentFactoryResolver, Input, OnInit, ViewContainerRef } from '@angular/core';
import { MapService } from 'services/map.service';
import {
  StAmountComponent, StAssetTypeComponent, StComparisonComponent, StDeltaComponent, StEventComponent, StPlayerComponent, StPlayerWinComponent, StRepeatableComponent, StResourceTypeComponent, StTriggerableByComponent, StTriggerTypeComponent, StXMaxComponent, StXMinComponent, StYMaxComponent, StYMinComponent
} from './subtrigger.component';

@Component({
  selector: 'app-dynamic-subtrigger-component',
  template: '',
})
export class DynamicSubtriggerComponent implements OnInit {
  @Input() triggerIndex: number;
  @Input() subtriggerIndex: number;

  constructor(private mapService: MapService,
    private viewContainerRef: ViewContainerRef,
    private resolver: ComponentFactoryResolver) {
  }

  ngOnInit() {
    const factory = this.resolver.resolveComponentFactory(this.getSubtriggerComponent());
    const component = this.viewContainerRef.createComponent(factory);
    (<any>component.instance).triggerIndex = this.triggerIndex;
    (<any>component.instance).subtriggerIndex = this.subtriggerIndex;
    (<any>component.instance).mapService = this.mapService;
  }

  getSubtriggerComponent() {
    let i = 0;
    const subscriptStrings: string[] = this.mapService.triggers[this.triggerIndex].split(' ');
    for (const j of [StTriggerTypeComponent, StTriggerableByComponent, StRepeatableComponent]) {
      if (this.subtriggerIndex === i) {
        return j;
      }
      ++i;
    }
    if (subscriptStrings[0] === '0') {
      for (const j of [StResourceTypeComponent, StComparisonComponent, StAmountComponent]) {
        if (this.subtriggerIndex === i) {
          return j;
        }
        ++i;
      }
    } else if (subscriptStrings[0] === '1') {
      for (const j of [StAssetTypeComponent, StComparisonComponent, StAmountComponent]) {
        if (this.subtriggerIndex === i) {
          return j;
        }
        ++i;
      }
    } else if (subscriptStrings[0] === '2') {
      for (const j of [StAssetTypeComponent, StXMinComponent, StXMaxComponent, StYMinComponent, StYMaxComponent]) {
        if (this.subtriggerIndex === i) {
          return j;
        }
        ++i;
      }
    }
    if (this.subtriggerIndex === i) {
      return StEventComponent;
    }
    ++i;
    if (subscriptStrings[i - 1] === 'EndGame') {
      for (const j of [StPlayerWinComponent]) {
        if (this.subtriggerIndex === i) {
          return j;
        }
        ++i;
      }
    } else if (subscriptStrings[i - 1] === 'ResourceChange') {
      for (const j of [StResourceTypeComponent, StDeltaComponent]) {
        if (this.subtriggerIndex === i) {
          return j;
        }
        ++i;
      }
    } else if (subscriptStrings[i - 1] === 'RandAssetKill') {
      for (const j of [StAssetTypeComponent, StAmountComponent]) {
        if (this.subtriggerIndex === i) {
          return j;
        }
        ++i;
      }
    } else if (subscriptStrings[i - 1] === 'SpawnAsset') {
      for (const j of [StPlayerComponent, StAssetTypeComponent, StXMinComponent, StXMaxComponent, StYMinComponent, StYMaxComponent]) {
        if (this.subtriggerIndex === i) {
          return j;
        }
        ++i;
      }
    }
  }
}
