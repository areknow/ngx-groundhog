import {
  Component,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  ElementRef,
  Attribute,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import {take} from 'rxjs/operators/take';
import {GhIconRegistry} from './icon-registry';

@Component({
  moduleId: module.id,
  template: '<ng-content></ng-content>',
  selector: 'gh-icon',
  exportAs: 'ghIcon',
  styleUrls: ['icon.css'],
  inputs: ['color'],
  host: {
    'role': 'img',
    'class': 'gh-icon',
  },
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GhIcon implements OnChanges {

  /** Name of the icon in the SVG icon set. */
  @Input() svgIcon: string;

  constructor(
    private _elementRef: ElementRef,
    private _iconRegistry: GhIconRegistry,
    @Attribute('aria-hidden') ariaHidden: string) {

    // If the user has not explicitly set aria-hidden, mark the icon as hidden, as this is
    // the right thing to do for the majority of icon use-cases.
    if (!ariaHidden) {
      _elementRef.nativeElement.setAttribute('aria-hidden', 'true');
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.svgIcon) {
      if (this.svgIcon) {
        const [namespace, iconName] = splitIconName(this.svgIcon);

        this._iconRegistry.getNamedSvgIcon(iconName, namespace).pipe(take(1)).subscribe(
          svg => this._setSvgElement(svg),
          (err: Error) => console.log(`Error retrieving icon: ${err.message}`)
        );
      } else {
        this._clearSvgElement();
      }
    }
  }

  private _setSvgElement(svg: SVGElement) {
    this._clearSvgElement();
    this._elementRef.nativeElement.appendChild(svg);
  }

  private _clearSvgElement() {
    const layoutElement: HTMLElement = this._elementRef.nativeElement;
    const childCount = layoutElement.childNodes.length;

    // Remove existing child nodes and add the new SVG element. Note that we can't
    // use innerHTML, because IE will throw if the element has a data binding.
    for (let i = 0; i < childCount; i++) {
      layoutElement.removeChild(layoutElement.childNodes[i]);
    }
  }
}

/**
   * Splits an svgIcon binding value into its icon set and icon name components.
   * Returns a 2-element array of [(icon set), (icon name)].
   * The separator for the two fields is ':'. If there is no separator, an empty
   * string is returned for the icon set and the entire value is returned for
   * the icon name. If the argument is falsy, returns an array of two empty strings.
   * Throws an error if the name contains two or more ':' separators.
   * Examples:
   *   `'social:cake' -> ['social', 'cake']
   *   'penguin' -> ['', 'penguin']
   *   null -> ['', '']
   *   'a:b:c' -> (throws Error)`
   */
function splitIconName(iconName: string): [string, string] {
  if (!iconName) {
    return ['', ''];
  }
  const parts = iconName.split(':');
  switch (parts.length) {
    case 1: return ['', parts[0]]; // Use default namespace.
    case 2: return <[string, string]>parts;
    default: throw Error(`Invalid icon name: "${iconName}"`);
  }
}
