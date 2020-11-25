import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { SituationPage } from './situation.page';
import { TranslocoModule } from '@ngneat/transloco';


const routes: Routes = [
  {
    path: '',
    component: SituationPage,
    children: [
      {
        path: 'overview',
        data: { breadcrumb: 'Overview' },
        children: [
          {
            path: '',
            loadChildren: () => import('../home/home.module').then(m => m.HomePageModule)
          }
        ]
      },
      {
        path: 'map',
        data: { breadcrumb: 'Map' },
        children: [
          {
            path: '',
            loadChildren: () => import('../home/home.module').then(m => m.HomePageModule)
          }
        ]
      },
      {
        path: 'dummy',
        loadChildren: () => import('../dummy/dummy.module').then(m => m.DummyPageModule)
      },
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full'
      },
      {
        path: '**',
        redirectTo: 'overview',
      }
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslocoModule,
  ],
  declarations: [SituationPage]
})
export class SituationPageModule { }
