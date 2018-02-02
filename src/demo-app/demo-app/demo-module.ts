import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {DemoGroundhogModule} from '../demo-groundhog-module';
import {ButtonDemo} from '../button/button-demo';
import {IconDemo} from '../icon/icon-demo';
import {DemoApp, Home} from './demo-app';
import {DEMO_APP_ROUTES} from './routes';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(DEMO_APP_ROUTES),
    DemoGroundhogModule
  ],
  declarations: [
    ButtonDemo,
    IconDemo,
    DemoApp,
    Home,
  ],
  entryComponents: [
    DemoApp,
  ],
})
export class DemoModule {}
