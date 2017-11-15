import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';

// Services
import { AnimationService } from 'services/animation.service';
import { AssetsService } from 'services/assets.service';
import { CanvasService } from 'services/canvas.service';
import { IOService } from 'services/io.service';
import { MapService } from 'services/map.service';
import { SerializeService } from 'services/serialize.service';
import { SpriteService } from 'services/sprite.service';
import { TerrainService } from 'services/terrain.service';
import { UserService } from 'services/user.service';

import { FooterComponent } from './footer/footer.component';
import { MapComponent } from './map/map.component';
import { NewmapComponent } from './newmap/newmap.component';
import { AssetsComponent } from './sidebar/assets/assets.component';
import { StructuresComponent } from './sidebar/assets/structures/structures.component';
import { UnitsComponent } from './sidebar/assets/units/units.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { TerrainComponent } from './sidebar/terrain/terrain.component';
import { UploadmapComponent } from './uploadmap/uploadmap.component';

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    SidebarComponent,
    FooterComponent,
    TerrainComponent,
    UnitsComponent,
    StructuresComponent,
    AssetsComponent,
    NewmapComponent,
    UploadmapComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
  ],
  providers: [
    AnimationService,
    AssetsService,
    CanvasService,
    IOService,
    MapService,
    SerializeService,
    SpriteService,
    TerrainService,
    UserService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
