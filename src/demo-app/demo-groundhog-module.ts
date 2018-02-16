import {NgModule} from '@angular/core';
import {
  GhButtonModule,
  GhIconModule,
  GhSelectModule,
  GhExpandableModule,
} from '@dynatrace/ngx-groundhog';

/**
 * NgModule that includes all Groundhog modules that are required to serve the demo-app.
 */
@NgModule({
  exports: [
    GhButtonModule,
    GhIconModule,
    GhSelectModule,
    GhExpandableModule,
  ]
})
export class DemoGroundhogModule {}
