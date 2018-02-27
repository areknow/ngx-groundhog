import {Component, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {ServerModule} from '@angular/platform-server';
import {
  GhButtonModule,
  GhIconModule,
  GhInputModule,
  GhIslandModule,
  GhFormFieldModule,
  GhProgressCircleModule,
  GhTileModule,
  GhThemingModule,
  GhContextMenuModule,
} from '@dynatrace/ngx-groundhog';

@Component({
  selector: 'kitchen-sink',
  templateUrl: './kitchen-sink.html',
})
export class KitchenSink {
  progressCircleMin = 100;
  progressCircleMax = 200;
  progressCircleValue = 150;
}

@NgModule({
  imports: [
    BrowserModule.withServerTransition({appId: 'kitchen-sink'}),
    GhButtonModule,
    GhIconModule,
    GhInputModule,
    GhIslandModule,
    GhFormFieldModule,
    GhProgressCircleModule,
    GhTileModule,
    GhThemingModule,
    GhContextMenuModule,
  ],
  bootstrap: [KitchenSink],
  declarations: [KitchenSink],
  entryComponents: [KitchenSink],
})
export class KitchenSinkClientModule { }

@NgModule({
  imports: [KitchenSinkClientModule, ServerModule],
  bootstrap: [KitchenSink],
  entryComponents: [KitchenSink],
})
export class KitchenSinkServerModule { }
