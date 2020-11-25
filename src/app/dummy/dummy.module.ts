import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DummyPageRoutingModule } from './dummy-routing.module';

import { DummyPage } from './dummy.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DummyPageRoutingModule
  ],
  declarations: [DummyPage]
})
export class DummyPageModule {}
