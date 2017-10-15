import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
git import { TempComponent } from './temp/temp.component';

// Services
import { MapService } from 'services/map.service';
import { MapComponent } from './map/map.component';

@NgModule({
  declarations: [
    AppComponent,
    TempComponent,
    MapComponent
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
