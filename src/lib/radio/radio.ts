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
} from '@angular/core';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { FocusMonitor } from '@angular/cdk/a11y';
import {
  mixinTabIndex,
  mixinDisabled,
  CanDisable,
  HasTabIndex
} from '@dynatrace/ngx-groundhog/core';
import { UniqueSelectionDispatcher } from '@angular/cdk/collections';

let nextUniqueId = 0;

/** Change event object emitted by GhRadioButton */
export interface GhRadioChange {
  source: GhRadioButton;
  value: any;
}

// Boilerplate for applying mixins to GhRadioButton.
export class GhRadioButtonBase {
  constructor() { }
}
export const _GhRadioButtonMixinBase = mixinTabIndex(mixinDisabled(GhRadioButtonBase));

@Component({
  moduleId: module.id,
  selector: 'gh-radio-button',
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
export class GhRadioButton extends _GhRadioButtonMixinBase implements CanDisable, HasTabIndex {

  private _uniqueId: string = `gh-radio-${++nextUniqueId}`;
  private _required: boolean;
  private _checked: boolean = false;
  private _value: any = null;

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

  @ViewChild('input') _inputElement: ElementRef;

  constructor(
    private _changeDetector: ChangeDetectorRef,
    private _radioDispatcher: UniqueSelectionDispatcher) {
    super();
    _radioDispatcher.listen((id: string, name: string) => {
      if (id != this.id && name == this.name) {
        this.checked = false;
      }
    });
  }

  /** Focuses the radio button. */
  focus(): void {
    this._inputElement.nativeElement.focus();
  }

  _onInputClick(event: Event) {
    // We have to stop propagation for click events on the visual hidden input element.
    // By default, when a user clicks on a label element, a generated click event will be
    // dispatched on the associated input element. Since we are using a label element as our
    // root container, the click event on the `radio-button` will be executed twice.
    // The real click event will bubble up, and the generated click event also tries to bubble up.
    // This will lead to multiple click events.
    // Preventing bubbling for the second event will solve that issue.
    event.stopPropagation();
  }

  _onInputChange(event: Event) {
    // We always have to stop propagation on the change event.
    // Otherwise the change event, from the input element, will bubble up and
    // emit its event object to the `change` output.
    event.stopPropagation();

    this.checked = true;
    this._emitChangeEvent();
  }

  /** Dispatch change event with current value. */
  private _emitChangeEvent(): void {
    this.change.emit({ source: this, value: this._value });
  }

}
