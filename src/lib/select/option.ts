import {
  Component,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Output,
  Input,
  EventEmitter,
  ElementRef,
} from '@angular/core';
import {mixinDisabled, CanDisable} from '@dynatrace/ngx-groundhog/core';
import {ENTER} from '@angular/cdk/keycodes';
import {SPACE} from '@angular/cdk/keycodes';

/**
 * Option IDs need to be unique across components, so this counter exists outside of
 * the component definition.
 */
let _uniqueIdCounter = 0;

/** Event object emitted by GhOption when selected or deselected. */
export interface GhOptionSelectionChange {
    /** Reference to the option that emitted the event. */
    source: GhOption;
    /** Whether the change in the option's value was a result of a user action. */
    isUserInput: boolean;
}

// Boilerplate for applying mixins to GhOption.
export class GhOptionBase {
  constructor() {}
}
export const _GhOptionMixinBase = mixinDisabled(GhOptionBase);

@Component({
  selector: 'gh-option',
  moduleId: module.id,
  exportAs: 'ghOption',
  templateUrl: 'option.html',
  styleUrls: ['option.css'],
  inputs: ['disabled'],
  host: {
    'role': 'option',
    '[id]': 'id',
    '[attr.tabindex]': '_getTabIndex()',
    '[attr.aria-selected]': 'selected.toString()',
    '[attr.aria-disabled]': 'disabled.toString()',
    '[class.gh-option-disabled]': 'disabled',
    '[class.gh-active]': 'active',
    '(click)': '_toggleViaInteraction()',
    '(keydown)': '_handleKeydown($event)',
    'class': 'gh-option',
  },
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GhOption extends _GhOptionMixinBase implements CanDisable {
  private _active = false;
  private _selected = false;
  private _id = `gh-option-${_uniqueIdCounter++}`;

  get selected() { return this._selected; }

  /** The displayed value of the option. */
  get viewValue(): string {
    return (this._elementRef.nativeElement.textContent || '').trim();
  }

  /** The unique ID of the option. */
  get id(): string { return this._id; }

  /**
   * Whether or not the option is currently active and ready to be selected.
   * An active option displays styles as if it is focused, but the
   * focus is actually retained somewhere else. This comes in handy
   * for components like autocomplete where focus must remain on the input.
   */
  get active(): boolean {
    return this._active;
  }

  /** The form value of the option. */
  @Input() value: any;

  /** Event emitted when the option is selected or deselected. */
  @Output() readonly onSelectionChange = new EventEmitter<GhOptionSelectionChange>();

  constructor (private _changeDetectorRef: ChangeDetectorRef,
               private _elementRef: ElementRef
  ) {
    super();
  }

  /** Selects the option. */
  select() {
    if (!this._selected) {
      this._selected = true;
      this._changeDetectorRef.markForCheck();
      this._emitSelectionChangeEvent();
    }
  }

  /** Deselects the option. */
  deselect() {
    if (this._selected) {
      this._selected = false;
      this._changeDetectorRef.markForCheck();
      this._emitSelectionChangeEvent();
    }
  }

  /** Sets focus onto this option. */
  focus(): void {
    const element = this._elementRef.nativeElement();
    if (typeof element.focus === 'function') {
      element.focus();
    }
  }

  /**
   * This method sets display styles on the option to make it appear
   * active. This is used by the ActiveDescendantKeyManager so key
   * events will display the proper options as active on arrow key events.
   */
  setActiveStyles(): void {
    if (!this._active) {
      this._active = true;
      this._changeDetectorRef.markForCheck();
    }
  }

  /**
   * This method removes display styles on the option that made it appear
   * active. This is used by the ActiveDescendantKeyManager so key
   * events will display the proper options as active on arrow key events.
   */
  setInactiveStyles(): void {
    if (this._active) {
      this._active = false;
      this._changeDetectorRef.markForCheck();
    }
  }

  /** Gets the label to be used when determining whether the option should be focused. */
  getLabel(): string {
    return this.viewValue;
  }

  /**
   * Selects the option while indicating the selection came from the user. Used to
   * determine if the select's view -> model callback should be invoked.
   */
  _toggleViaInteraction() {
    if (!this.disabled) {
      this._selected = !this._selected;
      this._changeDetectorRef.markForCheck();
      this._emitSelectionChangeEvent(true);
    }
  }

  /** Ensures the option is selected when activated from the keyboard. */
  _handleKeydown(event: KeyboardEvent): void {
    if (event.keyCode === ENTER || event.keyCode === SPACE) {
      this._toggleViaInteraction();

      // Prevent the page from scrolling down and form submits.
      event.preventDefault();
    }
  }

  /** Returns the correct tabindex for the option depending on disabled state. */
  _getTabIndex(): string {
    return this.disabled ? '-1' : '0';
  }


  /** Emits the selection change event. */
  private _emitSelectionChangeEvent(isUserInput = false): void {
    this.onSelectionChange.emit({source: this, isUserInput});
  }
}
