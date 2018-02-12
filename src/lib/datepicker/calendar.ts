import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  Input,
  Optional,
  Output,
  ChangeDetectorRef,
  OnDestroy,
  EventEmitter,
  Inject,
  OnInit,
  NgZone,
  ElementRef,
} from '@angular/core';
import {
  LEFT_ARROW,
  RIGHT_ARROW,
  UP_ARROW,
  HOME,
  DOWN_ARROW,
  END,
  PAGE_UP,
  PAGE_DOWN,
  ENTER
} from '@angular/cdk/keycodes';
import {DateAdapter, GH_DATE_FORMATS, GhDateFormats} from '@dynatrace/ngx-groundhog/core';
import {GhDatepickerIntl} from './datepicker-intl';
import {createMissingDateImplError} from './datepicker-errors';
import { Subscription } from 'rxjs/Subscription';
import { take } from 'rxjs/operators/take';


const DAYS_PER_WEEK = 7;

/**
 * An internal class that represents the data corresponding to a single calendar cell.
 */
export interface GhCalendarCell {
  value: number;
  displayValue: string;
  ariaLabel: string;
  enabled: boolean;
}

@Component({
  moduleId: module.id,
  selector: 'gh-calendar',
  templateUrl: 'calendar.html',
  styleUrls: ['calendar.css'],
  exportAs: 'ghCalendar',
  host: {
    'class': 'gh-calendar',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
})
export class GhCalendar<D> implements OnDestroy, OnInit {
  private _intlChanges: Subscription;
  private _selected: D | null;
  private _startAt: D | null;
  private _minDate: D | null;
  private _maxDate: D | null;
  private _clampedActiveDate: D;

  /** The currently selected date. */
  @Input()
  get selected(): D | null { return this._selected; }
  set selected(value: D | null) {
    this._selected = this._getValidDateOrNull(this._dateAdapter.deserialize(value));
    this._selectedDateIndex = this._getDateInCurrentMonth(this._selected);
  }

  /** A date representing the period (month or year) to start the calendar in. */
  @Input()
  get startAt(): D | null { return this._startAt; }
  set startAt(value: D | null) {
    this._startAt = this._getValidDateOrNull(this._dateAdapter.deserialize(value));
  }

  /** The minimum selectable date. */
  @Input()
  get minDate(): D | null { return this._minDate; }
  set minDate(value: D | null) {
    this._minDate = this._getValidDateOrNull(this._dateAdapter.deserialize(value));
  }

  /** The maximum selectable date. */
  @Input()
  get maxDate(): D | null { return this._maxDate; }
  set maxDate(value: D | null) {
    this._maxDate = this._getValidDateOrNull(this._dateAdapter.deserialize(value));
  }

  /** A function used to filter which dates are selectable. */
  @Input() dateFilter: (date: D) => boolean;

  /** Whether to allow selection of disabled cells. */
  @Input() allowDisabledSelection = false;

  /** Emits when the currently selected date changes. */
  @Output() readonly selectedChange: EventEmitter<D> = new EventEmitter<D>();

  /** Emits when any date is selected. */
  @Output() readonly _userSelection: EventEmitter<void> = new EventEmitter<void>();

  /**
   * The current active date. This determines which time period is shown and which date is
   * highlighted when using keyboard navigation.
   */
  get _activeDate(): D { return this._clampedActiveDate; }
  set _activeDate(value: D) {
    const oldActiveDate = this._activeDate;
    this._clampedActiveDate = this._dateAdapter.clampDate(value, this.minDate, this.maxDate);
    if (oldActiveDate && !this._hasSameMonthAndYear(oldActiveDate, this._clampedActiveDate)) {
      // Call init and reset stuff once _activeDate has been set and we are currently
      // in the same month and year as the old value.
      // Note: We only do this if we have an old value otherwise _init will be called
      // in the ngOnInit method.
      this._init();
    }
  }

  /** The label for the the previous button. */
  get _prevButtonLabel(): string { return this._intl.prevYearLabel; }

  /** The label for the the next button. */
  get _nextButtonLabel(): string { return this._intl.nextYearLabel; }

  /** The label for the current period (month & year). */
  get _periodText(): string {
    return this._dateAdapter
      .format(this._activeDate, this._dateFormats.display.monthYearLabel);
  }

  /** The number of blank cells to put at the beginning for the first row. */
  get _firstRowOffset(): number {
    return this._weeks && this._weeks.length && this._weeks[0].length ?
        this._numCols - this._weeks[0].length : 0;
  }

  /** The cell number of the active cell in the table. */
  get _activeCell() { return Math.max(0, this._dateAdapter.getDate(this._activeDate) - 1); }

  /** The names of the weekdays. */
  _weekdays: {long: string, short: string}[];

  /** Grid of calendar cells representing the dates of the month. */
  _weeks: GhCalendarCell[][];

  /** The number of blank cells in the first row before the 1st of the month. */
  _firstWeekOffset: number;

  /** The number of columns in the table. */
  _numCols = DAYS_PER_WEEK;

  /**
   * The date of the month that the currently selected Date falls on.
   * Null if the currently selected Date is in another month.
   */
  _selectedDateIndex: number | null;

  constructor(private _elementRef: ElementRef,
    private _intl: GhDatepickerIntl,
    private _ngZone: NgZone,
    @Optional() private _dateAdapter: DateAdapter<D>,
    @Optional() @Inject(GH_DATE_FORMATS) private _dateFormats: GhDateFormats,
    changeDetectorRef: ChangeDetectorRef,
  ) {
    if (!this._dateAdapter) {
      throw createMissingDateImplError('DateAdapter');
    }

    this._intlChanges = _intl.changes.subscribe(() => changeDetectorRef.markForCheck());

    // We need to set _activeDate right from the beginning so _getDateInCurrentMonth
    // has something to work with when input selected has been set from outside.
    this._activeDate = this._dateAdapter.today();

    const firstDayOfWeek = this._dateAdapter.getFirstDayOfWeek();
    const shortWeekdays = this._dateAdapter.getDayOfWeekNames('short');
    const longWeekdays = this._dateAdapter.getDayOfWeekNames('long');

    // Rotate the labels for days of the week based on the configured first day of the week.
    let weekdays = longWeekdays.map((long, i) => {
      return {long, short: shortWeekdays[i]};
    });
    this._weekdays = weekdays.slice(firstDayOfWeek).concat(weekdays.slice(0, firstDayOfWeek));
  }

  ngOnInit() {
    if (this.startAt) {
      // Change _activeDate now as we know startAt has been set
      this._activeDate = this.startAt;
    }

    // Call _init now once here and from now on when _activeDate has been set
    this._init();
    this._focusActiveCell();
  }

  ngOnDestroy() {
    this._intlChanges.unsubscribe();
  }

  /**
   * (Re)Initializes properties needed for creating the calendar.
   * Needs to be done at the beginning and everytime the month/year changes
   */
  _init() {
    const firstOfMonth = this._dateAdapter.createDate(this._dateAdapter.getYear(this._activeDate),
      this._dateAdapter.getMonth(this._activeDate), 1);
    this._selectedDateIndex = this._getDateInCurrentMonth(this.selected);
    this._firstWeekOffset = (DAYS_PER_WEEK + this._dateAdapter.getDayOfWeek(firstOfMonth) -
      this._dateAdapter.getFirstDayOfWeek()) % DAYS_PER_WEEK;
    this._createWeekCells();
  }

  /** Handles user clicks on the previous button. */
  _previousClicked() {
    this._activeDate = this._dateAdapter.addCalendarMonths(this._activeDate, -1);
  }

  /** Handles user clicks on the next button. */
  _nextClicked() {
    this._activeDate = this._dateAdapter.addCalendarMonths(this._activeDate, 1);
  }

  /** Whether the previous period button is enabled. */
  _previousEnabled(): boolean {
    if (!this.minDate) {
      return true;
    }
    return !this.minDate || !this._hasSameMonthAndYear(this._activeDate, this.minDate);
  }

  /** Whether the next period button is enabled. */
  _nextEnabled(): boolean {
    return !this.maxDate || !this._hasSameMonthAndYear(this._activeDate, this.maxDate);
  }

  _cellClicked(cell: GhCalendarCell): void {
    if (!this.allowDisabledSelection && !cell.enabled) {
      return;
    }
    this._dateSelectedByIndex(cell.value);
  }

  /** Handles when a new date is selected. */
  _dateSelectedByIndex(index: number) {
    if (this._selectedDateIndex != index) {
      const selectedYear = this._dateAdapter.getYear(this._activeDate);
      const selectedMonth = this._dateAdapter.getMonth(this._activeDate);
      const selectedDate = this._dateAdapter.createDate(selectedYear, selectedMonth, index);

      if (!this._dateAdapter.sameDate(selectedDate, this.selected)) {
        this.selectedChange.emit(selectedDate);
      }
    }

    this._userSelection.emit();
  }

  /** Handles date selection */
  _dateSelected(date: D): void {
    if (!this._dateAdapter.sameDate(date, this.selected)) {
      this.selectedChange.emit(date);
    }
  }

  /** Whether the provided row/cell is active */
  _isActiveCell(rowIndex: number, colIndex: number): boolean {
    let cellNumber = rowIndex * this._numCols + colIndex;
    // Account for the fact that the first row may not have as many cells.
    if (rowIndex) {
      cellNumber -= this._firstRowOffset;
    }
    return cellNumber == this._activeCell;
  }

  /** Handles keydown events on the calendar body. */
  _handleCalendarBodyKeydown(event: KeyboardEvent): void {
    switch (event.keyCode) {
      case LEFT_ARROW:
        this._activeDate = this._dateAdapter.addCalendarDays(this._activeDate, -1);
        break;
      case RIGHT_ARROW:
        this._activeDate = this._dateAdapter.addCalendarDays(this._activeDate, 1);
        break;
      case UP_ARROW:
        this._activeDate = this._dateAdapter.addCalendarDays(this._activeDate, -7);
        break;
      case DOWN_ARROW:
        this._activeDate = this._dateAdapter.addCalendarDays(this._activeDate, 7);
        break;
      case HOME:
        this._activeDate = this._dateAdapter.addCalendarDays(this._activeDate,
            1 - this._dateAdapter.getDate(this._activeDate));
        break;
      case END:
        this._activeDate = this._dateAdapter.addCalendarDays(this._activeDate,
            (this._dateAdapter.getNumDaysInMonth(this._activeDate) -
             this._dateAdapter.getDate(this._activeDate)));
        break;
      case PAGE_UP:
        this._activeDate = event.altKey ?
            this._dateAdapter.addCalendarYears(this._activeDate, -1) :
            this._dateAdapter.addCalendarMonths(this._activeDate, -1);
        break;
      case PAGE_DOWN:
        this._activeDate = event.altKey ?
            this._dateAdapter.addCalendarYears(this._activeDate, 1) :
            this._dateAdapter.addCalendarMonths(this._activeDate, 1);
        break;
      case ENTER:
        if (!this.dateFilter || this.dateFilter(this._activeDate)) {
          this._dateSelected(this._activeDate);
          this._userSelection.emit();
          // Prevent unexpected default actions such as form submission.
          event.preventDefault();
        }
        return;
      default:
        // Don't prevent default or focus active cell on keys that we don't explicitly handle.
        return;
    }

    this._focusActiveCell();
    // Prevent unexpected default actions such as form submission.
    event.preventDefault();
  }

  /** Focuses the active cell after the microtask queue is empty. */
  _focusActiveCell() {
    this._ngZone.runOutsideAngular(() => {
      this._ngZone.onStable.asObservable().pipe(take(1)).subscribe(() => {
        this._elementRef.nativeElement.querySelector('.gh-calendar-body-active').focus();
      });
    });
  }

  /** Whether the two dates represent the same month and year. */
  private _hasSameMonthAndYear(date1: D, date2: D): boolean {
      return this._dateAdapter.getYear(date1) == this._dateAdapter.getYear(date2) &&
          this._dateAdapter.getMonth(date1) == this._dateAdapter.getMonth(date2);
  }

  /**
   * Gets the date in this month that the given Date falls on.
   * Returns null if the given Date is in another month.
   */
  private _getDateInCurrentMonth(date: D | null): number | null {
    return date && this._hasSameMonthAndYear(date, this._activeDate) ?
        this._dateAdapter.getDate(date) : null;
  }

  /**
   * @param obj The object to check.
   * @returns The given object if it is both a date instance and valid, otherwise null.
   */
  private _getValidDateOrNull(obj: any): D | null {
    return (this._dateAdapter.isDateInstance(obj) && this._dateAdapter.isValid(obj)) ? obj : null;
  }

  /** Creates GhCalendarCells for the dates in this month. */
  private _createWeekCells() {
    const daysInMonth = this._dateAdapter.getNumDaysInMonth(this._activeDate);
    const dateNames = this._dateAdapter.getDateNames();
    this._weeks = [[]];
    for (let i = 0, cell = this._firstWeekOffset; i < daysInMonth; i++, cell++) {
      if (cell == DAYS_PER_WEEK) {
        this._weeks.push([]);
        cell = 0;
      }
      const date = this._dateAdapter.createDate(
        this._dateAdapter.getYear(this._activeDate),
        this._dateAdapter.getMonth(this._activeDate), i + 1);
      const enabled = this._shouldEnableDate(date);
      const ariaLabel = this._dateAdapter.format(date, this._dateFormats.display.dateA11yLabel);
      this._weeks[this._weeks.length - 1]
        .push(createCell(i + 1, dateNames[i], ariaLabel, enabled));
    }
  }

  /** Date filter for the month */
  private _shouldEnableDate(date: D): boolean {
    return !!date &&
      (!this.dateFilter || this.dateFilter(date)) &&
      (!this.minDate || this._dateAdapter.compareDate(date, this.minDate) >= 0) &&
      (!this.maxDate || this._dateAdapter.compareDate(date, this.maxDate) <= 0);
  }
}

/** Helper for creating a cell object */
function createCell(value: number, displayValue: string,
  ariaLabel: string, enabled: boolean): GhCalendarCell {
  return { value, displayValue, ariaLabel, enabled };
}
