import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  Input,
  ElementRef,
  ViewChild,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  Directive,
  ContentChildren,
  forwardRef,
  QueryList,
  Optional,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import {
  mixinTabIndex,
  mixinDisabled,
  CanDisable,
  HasTabIndex
} from '@dynatrace/ngx-groundhog/core';
import { UniqueSelectionDispatcher } from '@angular/cdk/collections';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

let nextUniqueId = 0;

/** Change event object emitted by GhRadioButton */
export interface GhRadioChange {
  source: GhRadioButton;
  value: any;
}

// Boilerplate for applying mixins to GhRadioGroup.
export class GhRadioGroupBase { }
export const _GhRadioGroupMixinBase = mixinDisabled(GhRadioGroupBase);

@Directive({
  selector: 'gh-radio-group',
  exportAs: 'ghRadioGroup',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => GhRadioGroup),
    multi: true
  }],
  host: {
    'role': 'radiogroup',
    'class': 'gh-radio-group',
  },
  inputs: ['disabled'],
})
export class GhRadioGroup extends _GhRadioGroupMixinBase {
  private _value: any = null;
  private _name: string = `gh-radio-group-${nextUniqueId++}`;
  private _selected: GhRadioButton | null = null;
  private _disabled: boolean = false;
  private _required: boolean = false;

  /** Name of the radio button group. All radio buttons inside this group will use this name. */
  @Input()
  get name(): string { return this._name; }
  set name(value: string) {
    this._name = value;
    this._updateRadioButtonNames();
  }

  /** Value of the radio button. */
  @Input()
  get value(): any { return this._value; }
  set value(newValue: any) {
    if (this._value != newValue) {
      this._value = newValue;
      this._updateSelectedRadioFromValue();
      this._checkSelectedRadioButton();
    }
  }

  /** Whether the radio button is selected. */
  @Input()
  get selected() { return this._selected; }
  set selected(selected: GhRadioButton | null) {
    this._selected = selected;
    this.value = selected ? selected.value : null;
    this._checkSelectedRadioButton();
  }

  /** Whether the radio group is disabled */
  @Input()
  get disabled(): boolean { return this._disabled; }
  set disabled(value) {
    this._disabled = coerceBooleanProperty(value);
    this._markRadiosForCheck();
  }

  /** Whether the radio group is required */
  @Input()
  get required(): boolean { return this._required; }
  set required(value: boolean) {
    this._required = coerceBooleanProperty(value);
    this._markRadiosForCheck();
  }

  @Output() readonly change: EventEmitter<GhRadioChange> = new EventEmitter<GhRadioChange>();

  onTouched: () => any = () => { };

  /** The method to be called in order to update ngModel */
  _controlValueAccessorChangeFn: (value: any) => void = () => { };

  @ContentChildren(forwardRef(() => GhRadioButton), { descendants: true })
  _radios: QueryList<GhRadioButton>;

  constructor(private _changeDetector: ChangeDetectorRef) {
    super();
  }

  _checkSelectedRadioButton() {
    if (this._selected && !this._selected.checked) {
      this._selected.checked = true;
    }
  }

  _touch() {
    if (this.onTouched) {
      this.onTouched();
    }
  }

  /** Dispatch change event with current selection and group value. */
  _emitChangeEvent(): void {
    this.change.emit({ source: this._selected!, value: this._value });
  }

  /** Implemented as a part of ControlValueAccessor. */
  writeValue(value: any) {
    this.value = value;
    this._changeDetector.markForCheck();
  }

  /** Implemented as a part of ControlValueAccessor. */
  registerOnChange(fn: (value: any) => void) {
    this._controlValueAccessorChangeFn = fn;
  }

  /** Implemented as a part of ControlValueAccessor. */
  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

  /** Implemented as a part of ControlValueAccessor. */
  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
    this._changeDetector.markForCheck();
  }

  private _markRadiosForCheck() {
    if (this._radios) {
      this._radios.forEach(radio => radio._markForCheck());
    }
  }

  /** Set the name of every radio button to the groups name */
  private _updateRadioButtonNames(): void {
    if (this._radios) {
      this._radios.forEach(radio => {
        radio.name = this.name;
      });
    }
  }

  /** Updates the `selected` state of each radio button based on the groups value. */
  private _updateSelectedRadioFromValue(): void {
    if (this._radios != null && !(this._selected != null && this._selected.value == this._value)) {
      this._selected = null;
      this._radios.forEach(radio => {
        radio.checked = this.value == radio.value;
        if (radio.checked) {
          this._selected = radio;
        }
      });
    }
  }
}

// Boilerplate for applying mixins to GhRadioButton.
export class GhRadioButtonBase {
  constructor() { }
}
export const _GhRadioButtonMixinBase = mixinTabIndex(mixinDisabled(GhRadioButtonBase));

@Component({
  moduleId: module.id,
  selector: 'gh-radio-button',
  exportAs: 'ghRadioButton',
  templateUrl: 'radio.html',
  styleUrls: ['radio.css'],
  inputs: ['disabled', 'tabIndex'],
  host: {
    'class': 'gh-radio-button',
    '[class.gh-radio-checked]': 'checked',
    '[class.gh-radio-disabled]': 'disabled',
    '[attr.id]': 'id',
    '(focus)': '_inputElement.nativeElement.focus()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
})
export class GhRadioButton extends _GhRadioButtonMixinBase
  implements AfterViewInit, OnDestroy, CanDisable, HasTabIndex {

  private _uniqueId: string = `gh-radio-${++nextUniqueId}`;
  private _required: boolean;
  private _checked: boolean = false;
  private _value: any = null;
  private _removeUniqueSelectionListener: () => void = () => {};


  /** The unique ID for the radio button. */
  @Input() id: string = this._uniqueId;

  /** Whether the radio button is required. */
  @Input()
  get required(): boolean { return this._required; }
  set required(value: boolean) { this._required = coerceBooleanProperty(value); }

  /** Whether this radio button is checked. */
  @Input()
  get checked(): boolean { return this._checked; }
  set checked(value: boolean) {
    const newCheckedState = coerceBooleanProperty(value);

    if (this._checked != newCheckedState) {
      this._checked = newCheckedState;
      if (newCheckedState) {
        // Notify all radio buttons with the same name to un-check.
        this._radioDispatcher.notify(this.id, this.name);
      }
      this._changeDetector.markForCheck();
    }
  }

  /** The value of this radio button. */
  @Input()
  get value(): any { return this._value; }
  set value(value: any) {
    if (this._value != value) {
      this._value = value;
    }
  }

  /** Analog to HTML 'name' attribute used to group radios for unique selection. */
  @Input() name: string;

  /** Used to set the 'aria-label' attribute on the underlying input element. */
  @Input('aria-label') ariaLabel: string;

  /** The 'aria-labelledby' attribute takes precedence as the element's text alternative. */
  @Input('aria-labelledby') ariaLabelledby: string;

  /** The 'aria-describedby' attribute is read after the element's label and field type. */
  @Input('aria-describedby') ariaDescribedby: string;

  @Output() readonly change: EventEmitter<GhRadioChange> = new EventEmitter<GhRadioChange>();

  /** ID of the native input element */
  get _inputId(): string { return `${this.id || this._uniqueId}-input`; }

  /** The native radio input element */
  @ViewChild('input') _inputElement: ElementRef;

  constructor(
    private _changeDetector: ChangeDetectorRef,
    private _radioDispatcher: UniqueSelectionDispatcher,
    private _focusMonitor: FocusMonitor,
    @Optional() private _radioGroup: GhRadioGroup) {
    super();
    this._removeUniqueSelectionListener =
      _radioDispatcher.listen((id: string, name: string) => {
        if (id != this.id && name == this.name) {
          this.checked = false;
        }
      });
  }

  ngAfterViewInit() {
    this._focusMonitor
      .monitor(this._inputElement.nativeElement, false)
      .subscribe(focusOrigin => this._onInputFocusChange(focusOrigin));
  }

  ngOnDestroy() {
    this._focusMonitor.stopMonitoring(this._inputElement.nativeElement);
    this._removeUniqueSelectionListener();
  }

  /** Focuses the radio button. */
  focus(): void {
    this._focusMonitor.focusVia(this._inputElement.nativeElement, 'keyboard');
  }

  _onInputClick(event: Event) {
    // We have to stop propagation for click events on the visual hidden input element.
    // Otherwise this will lead to multiple click events.
    event.stopPropagation();
  }

  _onInputChange(event: Event) {
    // We always have to stop propagation on the change event.
    // Otherwise the change event, from the input element, will bubble up and
    // emit its event object to the `change` output.
    event.stopPropagation();

    this.checked = true;
    this._emitChangeEvent();

    if (this._radioGroup) {
      this._radioGroup._controlValueAccessorChangeFn(this.value);
      this._radioGroup._touch();
      if (this._radioGroup && this.value != this._radioGroup.value) {
        this._radioGroup._emitChangeEvent();
      }
    }
  }

  _markForCheck() {
    this._changeDetector.markForCheck();
  }

  /** Dispatch change event with current value. */
  private _emitChangeEvent(): void {
    this.change.emit({ source: this, value: this._value });
  }

  private _onInputFocusChange(focusOrigin: FocusOrigin) {
    if (!focusOrigin && this._radioGroup) {
      this._radioGroup._touch();
    }
  }

}
