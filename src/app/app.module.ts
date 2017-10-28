import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';

// Services
import { MapService } from 'services/map.service';
import { AssetsService } from 'services/assets.service';
import { MapComponent } from './map/map.component';
import { TileComponent } from './map/tile/tile.component';

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    TileComponent,
  ],
  imports: [
    BrowserModule
  ],
  providers: [
    MapService,
    AssetsService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
