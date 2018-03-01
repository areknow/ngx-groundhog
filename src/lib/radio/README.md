# Radio

`<gh-radio>` provides the same functionality as a native <input type="radio"> enhanced with styling and animations.

```html
<gh-radio-group name="group0">
  <gh-radio-button value="aberfeldy">Aberfeldy</gh-radio-button>
  <gh-radio-button value="dalmore">Dalmore</gh-radio-button>
  <gh-radio-button value="jacky" disabled>Jack Daniels</gh-radio-button>
  <gh-radio-button value="glenlivet">Glenlivet</gh-radio-button>
</gh-radio-group>
```
All radio-buttons with the same name comprise a set from which only one may be selected at a time.

## Radio groups

Radio-buttons should typically be placed inside of an <gh-radio-group> unless the DOM structure would make that impossible.
The radio-group has a value property that reflects the currently selected radio-button inside of the group.
Individual radio-buttons inside of a radio-group will inherit the name of the group.

## Angular forms

`<gh-radio-group>` is compatible with `@angular/forms` and supports both `FormsModule` and `ReactiveFormsModule`.

## Accessibility

The `<gh-radio-button>` uses an internal `<input type="radio">` to provide an accessible experience.
This internal radio button receives focus and is automatically labelled by the text content of the `<gh-radio-button>` element.

Radio button groups should should be given a meaningful label via `aria-label` or `aria-labelledby`.
