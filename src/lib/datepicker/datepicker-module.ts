import {NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import {GhCalendar} from './calendar';
import {GhDatepicker} from './datepicker';
import {GhDatepickerIntl} from './datepicker-intl';
import {GhButtonModule} from '@dynatrace/ngx-groundhog/button';
import {GhDatepickerInput} from './datepicker-input';

@NgModule({
  imports: [
    CommonModule,
    GhButtonModule,
  ],
  exports: [
    GhCalendar,
    GhDatepicker,
    GhDatepickerInput
  ],
  declarations: [
    GhCalendar,
    GhDatepicker,
    GhDatepickerInput
  ],
  providers: [GhDatepickerIntl]
})
export class GhDatepickerModule {}
