import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';
import { MapModule } from '../map/map.module';
import { TranslocoModule } from '@ngneat/transloco';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    MapModule,
    TranslocoModule
  ],
  declarations: [HomePage]
})
export class HomePageModule {}
