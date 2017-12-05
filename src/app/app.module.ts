import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';

// Services
import { AnimationService } from 'services/animation.service';
import { AssetsService } from 'services/assets.service';
import { CanvasService } from 'services/canvas.service';
import { FileService } from 'services/file.service';
import { IOService } from 'services/io.service';
import { MapService } from 'services/map.service';
import { SerializeService } from 'services/serialize.service';
import { SoundService } from 'services/sound.service';
import { SpriteService } from 'services/sprite.service';
import { TerrainService } from 'services/terrain.service';
import { TilesetService } from 'services/tileset.service';
import { UserService } from 'services/user.service';

import { TestmapService } from 'services/testmap.service';
import { AiComponent } from './ai/ai.component';
import { DynamicSubtriggerComponent } from './ai/trigger/dynamic-subtrigger.component';
import {
  StAmountComponent, StAssetTypeComponent, StComparisonComponent, StDeltaComponent, StEventComponent, StPlayerComponent, StPlayerWinComponent, StRepeatableComponent, StResourceTypeComponent, StTriggerableByComponent, StTriggerTypeComponent, StXMaxComponent, StXMinComponent, StYMaxComponent, StYMinComponent
} from './ai/trigger/subtrigger.component';
import { TriggerComponent } from './ai/trigger/trigger.component';
import { AnimationComponent } from './animation/animation.component';
import { AudioComponent } from './audio/audio.component';
import { MapComponent } from './map/map.component';
import { NewmapComponent } from './newmap/newmap.component';
import { AssetsComponent } from './sidebar/assets/assets.component';
import { StructuresComponent } from './sidebar/assets/structures/structures.component';
import { UnitsComponent } from './sidebar/assets/units/units.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { TerrainComponent } from './sidebar/terrain/terrain.component';
import { TestmapComponent } from './testmap/testmap.component';
import { TilesetComponent } from './tileset/tileset.component';
import { UploadmapComponent } from './uploadmap/uploadmap.component';
import { MapDisplayComponent } from './web/map-display/map-display.component';
import { WebComponent } from './web/web.component';

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    SidebarComponent,
    TerrainComponent,
    UnitsComponent,
    StructuresComponent,
    AssetsComponent,
    NewmapComponent,
    UploadmapComponent,
    TilesetComponent,
    AnimationComponent,
    AudioComponent,
    WebComponent,
    MapDisplayComponent,
    AiComponent,
    TestmapComponent,
    TriggerComponent,
    DynamicSubtriggerComponent,
    StAmountComponent, StAssetTypeComponent, StComparisonComponent, StDeltaComponent, StEventComponent, StPlayerComponent, StPlayerWinComponent, StRepeatableComponent, StResourceTypeComponent, StTriggerableByComponent, StTriggerTypeComponent, StXMaxComponent, StXMinComponent, StYMaxComponent, StYMinComponent,
  ],
  entryComponents: [
    StAmountComponent, StAssetTypeComponent, StComparisonComponent, StDeltaComponent, StEventComponent, StPlayerComponent, StPlayerWinComponent, StRepeatableComponent, StResourceTypeComponent, StTriggerableByComponent, StTriggerTypeComponent, StXMaxComponent, StXMinComponent, StYMaxComponent, StYMinComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
  ],
  providers: [
    AnimationService,
    AssetsService,
    CanvasService,
    FileService,
    IOService,
    MapService,
    SerializeService,
    SoundService,
    SpriteService,
    TerrainService,
    TestmapService,
    TilesetService,
    UserService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
