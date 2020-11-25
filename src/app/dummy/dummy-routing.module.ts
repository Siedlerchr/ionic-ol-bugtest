import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DummyPage } from './dummy.page';

const routes: Routes = [
  {
    path: '',
    component: DummyPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DummyPageRoutingModule {}
