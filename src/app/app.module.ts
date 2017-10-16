import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { TempComponent } from './temp/temp.component';

// Services
import { MapService } from 'services/map.service';
import { MapComponent } from './map/map.component';
import { TileComponent } from './map/tile/tile.component';

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    TempComponent,
    TileComponent,
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
