import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { A11yModule } from '@angular/cdk/a11y';
import { UNIQUE_SELECTION_DISPATCHER_PROVIDER } from '@angular/cdk/collections';
import { GhRadioButton } from './radio';

@NgModule({
  imports: [CommonModule, A11yModule],
  exports: [GhRadioButton],
  declarations: [GhRadioButton],
  providers: [UNIQUE_SELECTION_DISPATCHER_PROVIDER],
})
export class GhRadioModule { }
