import {Routes} from '@angular/router';
import {ButtonDemo} from '../button/button-demo';
import {IconDemo} from '../icon/icon-demo';
import {InputDemo} from 'input/input-demo';
import {DemoApp, Home} from './demo-app';
import {SelectDemo} from '../select/select-demo';
import {ProgressCircleDemo} from '../progress-circle/progress-circle-demo';
import {IslandDemo} from '../island/island-demo';
import {TileDemo} from '../tile/tile-demo';
import {ContextMenuDemo} from '../context-menu/context-menu-demo';
import {RadioDemo} from '../radio/radio-demo';

export const DEMO_APP_ROUTES: Routes = [
  {path: '', component: DemoApp, children: [
    {path: '', component: Home},
    {path: 'button', component: ButtonDemo},
    {path: 'icon', component: IconDemo},
    {path: 'input', component: InputDemo},
    {path: 'island', component: IslandDemo},
    {path: 'progress-circle', component: ProgressCircleDemo},
    {path: 'radio', component: RadioDemo},
    {path: 'select', component: SelectDemo},
    {path: 'tile', component: TileDemo},
    {path: 'context-menu', component: ContextMenuDemo},
  ]}
];

export const ALL_ROUTES: Routes = [
  {path: '',  component: DemoApp, children: DEMO_APP_ROUTES},
];
