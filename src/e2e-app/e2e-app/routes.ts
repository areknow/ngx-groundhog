import {Routes} from '@angular/router';
import {Home} from './e2e-app';
import {ButtonE2E} from '../button/button-e2e';
import {InputE2E} from '../input/input-e2e';
import {TileE2E} from '../tile/tile-e2e';
import {ContextMenuE2E} from 'context-menu/context-menu-e2e';
import {RadioButtonsE2E} from 'radio/radio-e2e';

export const E2E_APP_ROUTES: Routes = [
  {path: '', component: Home},
  {path: 'button', component: ButtonE2E},
  {path: 'input', component: InputE2E},
  {path: 'radio', component: RadioButtonsE2E},
  {path: 'tile', component: TileE2E},
  {path: 'context-menu', component: ContextMenuE2E},
];
