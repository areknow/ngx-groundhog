/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {ButtonDemo} from '../button/button-demo';
import {DemoApp, Home} from './demo-app';
import {DEMO_APP_ROUTES} from './routes';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(DEMO_APP_ROUTES),
  ],
  declarations: [
    ButtonDemo,
    DemoApp,
    Home,
  ],
  entryComponents: [
    DemoApp,
  ],
})
export class DemoModule {}
