import {
  Directive,
  Component,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  ElementRef,
  OnDestroy,
  Input
} from '@angular/core';
import {FocusMonitor} from '@angular/cdk/a11y';
import {
  CanDisable,
  mixinDisabled,
} from '@dynatrace/ngx-groundhog/core';

/**
 * List of classes to add to GhButton instances based on host attributes to
 * style as different variants.
 */
const BUTTON_HOST_ATTRIBUTES = [
  'gh-button',
  'gh-icon-button'
];

// Boilerplate for applying mixins to GhButton.
export class GhButtonBase {
  constructor(public _elementRef: ElementRef) {}
}
export const _GhButtonMixinBase = mixinDisabled(GhButtonBase);

export type ButtonColor = 'default' | 'accent' | 'warning' | 'error'  | 'cta' | undefined;
export type ButtonVariant = 'primary' | 'secondary';
const defaultColor = 'default';
const defaultVariant = 'primary';

/**
 * Groundhog design button.
 */
@Component({
  moduleId: module.id,
  selector: `button[gh-button], button[gh-icon-button]`,
  exportAs: 'ghButton',
  host: {
    '[disabled]': 'disabled || null',
  },
  templateUrl: 'button.html',
  styleUrls: ['button.css'],
  inputs: ['disabled'],
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GhButton extends _GhButtonMixinBase implements OnDestroy, CanDisable {

  @Input()
  get color(): ButtonColor { return this._color; }
  set color(value: ButtonColor) {
    const color = value || defaultColor;
    if (color !== this._color) {
      this._replaceCssClass(color, this._color);
      this._color = color;
    }
  }

  @Input()
  get variant(): ButtonVariant { return this._variant; }
  set variant(value: ButtonVariant) {
    const variant = value || defaultVariant;
    if (variant !== this._variant) {
      this._replaceCssClass(variant, this._variant);
      this._variant = variant;
    }
  }

  /** Whether the button is icon button. */
  _isIconButton: boolean = this._hasHostAttributes('gh-icon-button');

  private _color: ButtonColor;
  private _variant: ButtonVariant;

  constructor(elementRef: ElementRef,
              private _focusMonitor: FocusMonitor) {
    super(elementRef);

    // Set the default color and variant to trigger the setters.
    this.color = defaultColor;
    this.variant = defaultVariant;

    // For each of the variant selectors that is prevent in the button's host
    // attributes, add the correct corresponding class.
    for (const attr of  BUTTON_HOST_ATTRIBUTES) {
      if (this._hasHostAttributes(attr)) {
        (elementRef.nativeElement as HTMLElement).classList.add(attr);
      }
    }

    this._focusMonitor.monitor(this._elementRef.nativeElement, true);
  }

  ngOnDestroy() {
    this._focusMonitor.stopMonitoring(this._elementRef.nativeElement);
  }

  /** Focuses the button. */
  focus(): void {
    this._getHostElement().focus();
  }

  private _getHostElement() {
    return this._elementRef.nativeElement;
  }

  /** Gets whether the button has one of the given attributes. */
  private _hasHostAttributes(...attributes: string[]) {
    return attributes.some(attribute => this._getHostElement().hasAttribute(attribute));
  }

  private _replaceCssClass(newClass?: string, oldClass?: string) {
    if (oldClass) {
      this._elementRef.nativeElement.classList.remove(`gh-button-${oldClass}`);
    }
    if (newClass) {
      this._elementRef.nativeElement.classList.add(`gh-button-${newClass}`);
    }
  }

}

/**
 * Groundhog design button.
 */
@Component({
  moduleId: module.id,
  selector: `a[gh-button]`,
  exportAs: 'ghButton, ghAnchor',
  host: {
    '[attr.tabindex]': 'disabled ? -1 : 0',
    '[attr.disabled]': 'disabled || null',
    '[attr.aria-disabled]': 'disabled.toString()',
    '(click)': '_haltDisabledEvents($event)',
  },
  inputs: ['disabled', 'color'],
  templateUrl: 'button.html',
  styleUrls: ['button.css'],
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GhAnchor extends GhButton {
  constructor(elementRef: ElementRef,
              focusMonitor: FocusMonitor) {
    super(elementRef, focusMonitor);
  }

  _haltDisabledEvents(event: Event) {
    // A disabled button shouldn't apply any actions
    if (this.disabled) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }
}
