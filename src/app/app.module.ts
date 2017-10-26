import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';

// Services
import { MapService } from 'services/map.service';
import { MapComponent } from './map/map.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { FooterComponent } from './footer/footer.component';
import { TerrainComponent } from './sidebar/terrain/terrain.component';
import { UnitsComponent } from './sidebar/assets/units/units.component';
import { StructuresComponent } from './sidebar/assets/structures/structures.component';
import { AssetsComponent } from './sidebar/assets/assets.component';

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
  ],
  imports: [
    BrowserModule
  ],
  providers: [
    MapService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
