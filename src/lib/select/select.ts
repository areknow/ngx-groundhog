import {
  Component,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  Input,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
  ContentChildren,
  QueryList,
  OnInit,
  OnDestroy,
  AfterContentInit,
  NgZone,
  Attribute,
} from '@angular/core';
import {NgClass} from '@angular/common';
import {SelectionModel} from '@angular/cdk/collections';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {ENTER, SPACE} from '@angular/cdk/keycodes';
import {startWith} from 'rxjs/operators/startWith';
import {takeUntil} from 'rxjs/operators/takeUntil';
import {switchMap} from 'rxjs/operators/switchMap';
import {filter} from 'rxjs/operators/filter';
import {take} from 'rxjs/operators/take';
import {merge} from 'rxjs/observable/merge';
import {defer} from 'rxjs/observable/defer';
import {Observable} from 'rxjs/Observable';
import {mixinDisabled, CanDisable, mixinTabIndex, HasTabIndex} from '@dynatrace/ngx-groundhog/core';
import {GhOption, GhOptionSelectionChange} from './option';
import {Subject} from 'rxjs/Subject';
import {DOWN_ARROW} from '@angular/cdk/keycodes';
import {UP_ARROW} from '@angular/cdk/keycodes';
import {LEFT_ARROW} from '@angular/cdk/keycodes';
import {RIGHT_ARROW} from '@angular/cdk/keycodes';
import {HOME} from '@angular/cdk/keycodes';
import {END} from '@angular/cdk/keycodes';
import {ActiveDescendantKeyManager} from '@angular/cdk/a11y';

/**
 * Select IDs need to be unique across components, so this counter exists outside of
 * the component definition.
 */
let nextUniqueId = 0;

// Boilerplate for applying mixins to GhSelect.
export class GhSelectBase {
  constructor() {}
}
export const _GhSelectMixinBase = mixinTabIndex(mixinDisabled(GhSelectBase));

@Component({
  moduleId: module.id,
  selector: 'gh-select',
  exportAs: 'ghSelect',
  templateUrl: 'select.html',
  styleUrls: ['select.css'],
  inputs: ['disabled', 'tabIndex'],
  host: {
    'role': 'listbox',
    '[attr.id]': 'id',
    '[attr.tabindex]': 'tabIndex',
    '[attr.aria-label]': '_ariaLabel',
    '[attr.aria-labelledby]': 'ariaLabelledby',
    '[attr.aria-required]': 'required.toString()',
    '[attr.aria-disabled]': 'disabled.toString()',
    '[attr.aria-owns]': 'panelOpen ? _optionIds : null',
    'attr.aria-multiselectable': 'false',
    '[attr.aria-describedby]': '_ariaDescribedby || null',
    '[class.gh-select-disabled]': 'disabled',
    '[class.gh-select-required]': 'required',
    'class': 'gh-select',
    '(focus)': '_onFocus()',
    '(blur)': '_onBlur()',
    '(keydown)': '_handleKeydown($event)'
  },
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GhSelect extends _GhSelectMixinBase
  implements OnInit, AfterContentInit, OnDestroy, CanDisable, HasTabIndex {

  /** The placeholder displayed in the trigger of the select. */
  private _placeholder: string;

  /** Whether or not the overlay panel is open. */
  private _panelOpen = false;

  /** Whether filling out the select is required in the form. */
  private _required = false;

  /** Unique id for this input. */
  private _uid = `gh-select-${nextUniqueId++}`;

  /** _uid or provided id via input */
  private _id: string ;

  /** Current value of the select */
  private _value: any;

  /** Emits whenever the component is destroyed. */
  private _destroy = new Subject();

  /** Deals with the selection logic. */
  _selectionModel: SelectionModel<GhOption>;

  /** The IDs of child options to be passed to the aria-owns attribute. */
  _optionIds: string = '';

  /** The aria-describedby attribute on the select for improved a11y. */
  _ariaDescribedby: string; // TODO @thomaspink: Implement when adding support for angular forms

  /** Whether the select is focused. */
  focused: boolean = false;

  /** Manages keyboard events for options in the panel. */
  _keyManager: ActiveDescendantKeyManager<GhOption>;

  /** Classes to be passed to the select panel. Supports the same syntax as `ngClass`. */
  @Input() panelClass: string | Set<string> | string[] | {[key: string]: any};

  /** Placeholder to be shown if no value has been selected. */
  @Input()
  get placeholder() { return this._placeholder; }
  set placeholder(newplaceholder: string) {
    this._placeholder = newplaceholder;
  }

  /** Value of the select. */
  @Input()
  get value(): any { return this._value; }
  set value(newValue: any) {
    // Only set the new value if it differes from the old one
    if (newValue !== this._value) {
      this._value = newValue;
    }
  }

  /** Unique id of the element. */
  @Input()
  get id(): string { return this._id; }
  set id(value: string) {
    this._id = value || this._uid;
  }

  /** Whether the component is required. */
  @Input()
  get required(): boolean { return this._required; }
  set required(value: boolean) {
    this._required = coerceBooleanProperty(value);
  }

  /** Aria label of the select. If not specified, the placeholder will be used as label. */
  @Input('aria-label') ariaLabel: string = '';

  /** Input that can be used to specify the `aria-labelledby` attribute. */
  @Input('aria-labelledby') ariaLabelledby: string;

  /** The currently selected option. */
  get selected(): GhOption {
    return this._selectionModel.selected[0];
  }

  /** Whether the select has a value. */
  get empty() {
    return !this._selectionModel || this._selectionModel.isEmpty();
  }

  /** The value displayed in the trigger. */
  get triggerValue() {
    return this.empty ? '' : this._selectionModel.selected[0].viewValue;
  }

  /** Whether or not the overlay panel is open. */
  get panelOpen() {
    return this._panelOpen;
  }

  /** Returns the aria-label of the select component. */
  get _ariaLabel(): string | null {
    // If an ariaLabelledby value has been set, the select should not overwrite the
    // `aria-labelledby` value by setting the ariaLabel to the placeholder.
    return this.ariaLabelledby ? null : this.ariaLabel || this.placeholder;
  }

  /** Panel containing the select options. */
  @ViewChild('panel') panel: ElementRef;

  /** All of the defined select options. */
  @ContentChildren(GhOption, {descendants: true})
  options: QueryList<GhOption>;

  /** Combined stream of all of the child options' change events. */
  optionSelectionChanges: Observable<GhOptionSelectionChange> = defer(() => {
    if (this.options) {
      // This will create an array of onSelectionChange Observables and
      // then combine/merge them into one so we can later easily subscribe
      // to all at once and get the event (the option plus isUserEvent flag)
      // of the triggered option
      return merge(...this.options.map(option => option.onSelectionChange));
    }

    return this._ngZone.onStable
      .asObservable()
      .pipe(take(1), switchMap(() => this.optionSelectionChanges));
  });

  constructor(
    private _elementRef: ElementRef,
    private _changeDetectorRef: ChangeDetectorRef,
    private _ngZone: NgZone,
    @Attribute('tabindex') tabIndex: string
  ) {
    super();
    this.tabIndex = parseInt(tabIndex) || 0;
  }

  /**
   * Hook that triggers after the component has been initialized
   * and the first change detection has run.
   */
  ngOnInit() {
    this._selectionModel = new SelectionModel<GhOption>(false, undefined, false);
  }

  /** Hook that triggers when ng-content and all sub components (the options) are initialized. */
  ngAfterContentInit(): void {
    this._initKeyManager();

    // After the ng-content has been initialized we can start listening on
    // the options query list for changes (new options get added, removed,...)
    this.options.changes
      .pipe(startWith(null), takeUntil(this._destroy))
      // Everytime options change, we need to reset (resubscribe on their events, ...)
      .subscribe(() => this._resetOptions());
  }

  /** Hook that trigger right before the component will be destroyed. */
  ngOnDestroy(): void {
    this._destroy.next();
    this._destroy.complete();
  }

  /** Opens the panel */
  open() {
    if (!this.disabled && !this._panelOpen) {
      this._panelOpen = true;
      this._changeDetectorRef.markForCheck();
    }
  }

  /** Closes the panel */
  close() {
    if (this._panelOpen) {
      this._panelOpen = false;
      this._changeDetectorRef.markForCheck();
    }
  }

  /** Toggles the panel */
  toggle() {
    this._panelOpen ? this.close() : this.open();
  }

  /** Focuses the select element. */
  focus(): void {
    this._elementRef.nativeElement.focus();
  }

  /** Drops current option subscriptions and resets from scratch. */
  _resetOptions() {
    this.optionSelectionChanges
      .pipe(
        // Stop listening when the component will be destroyed
        // or the options have changed (new ones added or removed)
        takeUntil(merge(this._destroy, this.options.changes)),
        // We only need user events.
        // The other ones are triggered to select/deselect on GhSelect level
        filter(event => event.isUserInput))
      .subscribe(evt => {
        // Note: The event.source is the selected GhOption
        this._onSelect(evt.source);

        if (this._panelOpen) {
          this.close();
        }
      });

      this._setOptionIds();
  }

  /** Handles all keydown events on the select. */
  _handleKeydown(event: KeyboardEvent): void {
    if (!this.disabled) {
      this.panelOpen ? this._handleOpenKeydown(event) : this._handleClosedKeydown(event);
    }
  }

  /** Handles keyboard events while the select is closed. */
  private _handleClosedKeydown(event: KeyboardEvent): void {
    const keyCode = event.keyCode;
    const isArrowKey = keyCode === DOWN_ARROW || keyCode === UP_ARROW ||
        keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW;
    const isOpenKey = keyCode === ENTER || keyCode === SPACE;

    // Open the select on ALT + arrow key to match the native <select>
    if (isOpenKey || (event.altKey && isArrowKey)) {
      // prevents the page from scrolling down when pressing space, enter or alt+arrow
      event.preventDefault();
      this.open();
    } else {
      this._keyManager.onKeydown(event);
    }
  }

  /** Handles keyboard events when the selected is open. */
  private _handleOpenKeydown(event: KeyboardEvent): void {
    const keyCode = event.keyCode;
    const isArrowKey = keyCode === DOWN_ARROW || keyCode === UP_ARROW;
    const manager = this._keyManager;

    if (keyCode === HOME || keyCode === END) {
      event.preventDefault();
      keyCode === HOME ? manager.setFirstItemActive() : manager.setLastItemActive();
    } else if (isArrowKey && event.altKey) {
      // Close the select on ALT + arrow key to match the native <select>
      event.preventDefault();
      this.close();
    } else if ((keyCode === ENTER || keyCode === SPACE) && manager.activeItem) {
      event.preventDefault();
      manager.activeItem._toggleViaInteraction();
    } else {
      const previouslyFocusedIndex = manager.activeItemIndex;
      manager.onKeydown(event);
    }
  }

  /** Invoked when the control gains focus. */
  _onFocus() {
    if (!this.disabled) {
      this.focused = true;
    }
  }

  /** Invoked when the control looses focus. */
  _onBlur() {
    this.focused = false;

    if (!this.disabled && !this.panelOpen) {
      this._changeDetectorRef.markForCheck();
    }
  }

  /** Scrolls the active option into view. */
  private _scrollActiveOptionIntoView(): void {
    // TODO @thomaspink: Implement panel resizing & scroll logic
  }

  /** Invoked when an option is clicked. */
  private _onSelect(option: GhOption): void {
    const wasSelected = this._selectionModel.isSelected(option);

    // Deselect all other options (than the one we just selected)
    // and clear all options from our selectionModel
    this._clearSelection(option);
    this._selectionModel.select(option);

    // Only propagate changes if the option has really changed.
    // We do not want change events triggerd if the same option
    // got selected twice in a row.
    if (wasSelected !== this._selectionModel.isSelected(option)) {
      this._propagateChanges();
    }
  }

  /** Clears the select trigger and deselects every option in the list. */
  private _clearSelection(skip?: GhOption): void {
    this._selectionModel.clear();
    this.options.forEach(option => {
      if (option !== skip) {
        option.deselect();
      }
    });
  }

  /** Sets up a key manager to listen to keyboard events on the overlay panel. */
  private _initKeyManager() {
    this._keyManager = new ActiveDescendantKeyManager<GhOption>(this.options)
      .withTypeAhead();

    this._keyManager.tabOut.pipe(takeUntil(this._destroy)).subscribe(() => this.close());
    this._keyManager.change.pipe(takeUntil(this._destroy)).subscribe(() => {
      if (this._panelOpen && this.panel) {
        this._scrollActiveOptionIntoView();
      } else if (!this._panelOpen && this._keyManager.activeItem) {
        this._keyManager.activeItem._toggleViaInteraction();
      }
    });
  }

  /** Emits change event to set the model value. */
  private _propagateChanges(fallbackValue?: any): void {
    const valueToEmit = this.selected ? (this.selected as GhOption).value : fallbackValue;
    this._value = valueToEmit;
    this._changeDetectorRef.markForCheck();
  }

  /** Records option IDs to pass to the aria-owns property. */
  private _setOptionIds() {
    this._optionIds = this.options.map(option => option.id).join(' ');
  }
}
