import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';

// Services
import { MapService } from 'services/map.service';
import { MapComponent } from './map/map.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { FooterComponent } from './footer/footer.component';
import { PropertiesComponent } from './properties/properties.component';
import { NewmapComponent } from './newmap/newmap.component';
import { UploadmapComponent } from './uploadmap/uploadmap.component';

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    SidebarComponent,
    FooterComponent,
    PropertiesComponent,
    NewmapComponent,
    UploadmapComponent,
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
