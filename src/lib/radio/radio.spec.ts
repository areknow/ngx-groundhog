import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, NgModel, ReactiveFormsModule } from '@angular/forms';
import { Component, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { GhRadioButton, GhRadioChange, GhRadioGroup, GhRadioModule } from './index';
import { dispatchFakeEvent } from '@dynatrace/ngx-groundhog/core';


describe('GhRadio', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [GhRadioModule, FormsModule, ReactiveFormsModule],
      declarations: [
        // FocusableRadioButton,
        RadiosInsideRadioGroup,
        // RadioGroupWithNgModel,
        // RadioGroupWithFormControl,
        StandaloneRadioButtons,
        // InterleavedRadioGroup,
        // TranscludingWrapper
      ]
    });

    TestBed.compileComponents();
  }));

  describe('inside of a group', () => {
    let fixture: ComponentFixture<RadiosInsideRadioGroup>;
    let groupDebugElement: DebugElement;
    let radioDebugElements: DebugElement[];
    let radioNativeElements: HTMLElement[];
    let radioLabelElements: HTMLLabelElement[];
    let radioInputElements: HTMLInputElement[];
    let groupInstance: GhRadioGroup;
    let radioInstances: GhRadioButton[];
    let testComponent: RadiosInsideRadioGroup;

    beforeEach(async(() => {
      fixture = TestBed.createComponent(RadiosInsideRadioGroup);
      fixture.detectChanges();

      testComponent = fixture.debugElement.componentInstance;

      groupDebugElement = fixture.debugElement.query(By.directive(GhRadioGroup));
      groupInstance = groupDebugElement.injector.get<GhRadioGroup>(GhRadioGroup);

      radioDebugElements = fixture.debugElement.queryAll(By.directive(GhRadioButton));
      radioNativeElements = radioDebugElements.map(debugEl => debugEl.nativeElement);
      radioInstances = radioDebugElements.map(debugEl => debugEl.componentInstance);

      radioLabelElements = radioDebugElements
        .map(debugEl => debugEl.query(By.css('label')).nativeElement);
      radioInputElements = radioDebugElements
        .map(debugEl => debugEl.query(By.css('input')).nativeElement);
    }));

    it('should set individual radio names based on the group name', () => {
      expect(groupInstance.name).toBeTruthy();
      for (const radio of radioInstances) {
        expect(radio.name).toBe(groupInstance.name);
      }
    });

    it('should coerce the disabled binding on the radio group', () => {
      (groupInstance as any).disabled = '';
      fixture.detectChanges();

      radioLabelElements[0].click();
      fixture.detectChanges();

      expect(radioInstances[0].checked).toBe(false);
      expect(groupInstance.disabled).toBe(true);
    });

    it('should disable click interaction when the group is disabled', () => {
      testComponent.isGroupDisabled = true;
      fixture.detectChanges();

      radioLabelElements[0].click();
      fixture.detectChanges();

      expect(radioInstances[0].checked).toBe(false);
    });

    it('should disable click interaction when the group is disabled', () => {
      testComponent.isGroupDisabled = true;
      fixture.detectChanges();

      radioLabelElements[0].click();
      fixture.detectChanges();

      expect(radioInstances[0].checked).toBe(false);
    });

    it('should disable each individual radio when the group is disabled', () => {
      testComponent.isGroupDisabled = true;
      fixture.detectChanges();

      for (const radio of radioInstances) {
        expect(radio.disabled).toBe(true);
      }
    });

    it('should set required to each radio button when the group is required', () => {
      testComponent.isGroupRequired = true;
      fixture.detectChanges();

      for (const radio of radioInstances) {
        expect(radio.required).toBe(true);
      }
    });

    it('should update the group value when one of the radios changes', () => {
      expect(groupInstance.value).toBeFalsy();

      radioInstances[0].checked = true;
      fixture.detectChanges();

      expect(groupInstance.value).toBe('fire');
      expect(groupInstance.selected).toBe(radioInstances[0]);
    });

    it('should update the group and radios when one of the radios is clicked', () => {
      expect(groupInstance.value).toBeFalsy();

      radioLabelElements[0].click();
      fixture.detectChanges();

      expect(groupInstance.value).toBe('fire');
      expect(groupInstance.selected).toBe(radioInstances[0]);
      expect(radioInstances[0].checked).toBe(true);
      expect(radioInstances[1].checked).toBe(false);

      radioLabelElements[1].click();
      fixture.detectChanges();

      expect(groupInstance.value).toBe('water');
      expect(groupInstance.selected).toBe(radioInstances[1]);
      expect(radioInstances[0].checked).toBe(false);
      expect(radioInstances[1].checked).toBe(true);
    });

    it('should check a radio upon interaction with the underlying native radio button', () => {
      radioInputElements[0].click();
      fixture.detectChanges();

      expect(radioInstances[0].checked).toBe(true);
      expect(groupInstance.value).toBe('fire');
      expect(groupInstance.selected).toBe(radioInstances[0]);
    });

    it('should emit a change event from radio buttons', () => {
      expect(radioInstances[0].checked).toBe(false);

      const spies = radioInstances
        .map((radio, index) => jasmine.createSpy(`onChangeSpy ${index} for ${radio.name}`));

      spies.forEach((spy, index) => radioInstances[index].change.subscribe(spy));

      radioLabelElements[0].click();
      fixture.detectChanges();

      expect(spies[0]).toHaveBeenCalled();

      radioLabelElements[1].click();
      fixture.detectChanges();

      // To match the native radio button behavior, the change event shouldn't
      // be triggered when the radio got unselected.
      expect(spies[0]).toHaveBeenCalledTimes(1);
      expect(spies[1]).toHaveBeenCalledTimes(1);
    });

    // TODO @thomaspink: Not quit sure why this fails. Investigate
    // it(`should not emit a change event from the radio group when change group
    //   value programmatically`, () => {
    //     expect(groupInstance.value).toBeFalsy();

    //     const changeSpy = jasmine.createSpy('radio-group change listener');
    //     groupInstance.change.subscribe(changeSpy);

    //     radioLabelElements[0].click();
    //     fixture.detectChanges();

    //     expect(changeSpy).toHaveBeenCalledTimes(1);
    //     groupInstance.value = 'water';
    //     fixture.detectChanges();
    //     expect(changeSpy).toHaveBeenCalledTimes(1);
    //   });

    it('should update the group and radios when updating the group value', () => {
      expect(groupInstance.value).toBeFalsy();

      testComponent.groupValue = 'fire';
      fixture.detectChanges();

      expect(groupInstance.value).toBe('fire');
      expect(groupInstance.selected).toBe(radioInstances[0]);
      expect(radioInstances[0].checked).toBe(true);
      expect(radioInstances[1].checked).toBe(false);

      testComponent.groupValue = 'water';
      fixture.detectChanges();

      expect(groupInstance.value).toBe('water');
      expect(groupInstance.selected).toBe(radioInstances[1]);
      expect(radioInstances[0].checked).toBe(false);
      expect(radioInstances[1].checked).toBe(true);
    });

    it('should deselect all of the radios when the group value is cleared', () => {
      radioInstances[0].checked = true;

      expect(groupInstance.value).toBeTruthy();

      groupInstance.value = null;

      expect(radioInstances.every(radio => !radio.checked)).toBe(true);
    });

    it('should show a focus ring when focusing via the keyboard', () => {
      expect(radioNativeElements[0].classList.contains('gh-radio-focused'))
        .toBeFalsy('Expected no focus ring on init.');

      dispatchFakeEvent(radioInputElements[0], 'keydown');
      dispatchFakeEvent(radioInputElements[0], 'focus');

      expect(radioNativeElements[0].classList.contains('gh-radio-focused'))
        .toBeTruthy('Expected a focus ring on keyboard focus.');

      dispatchFakeEvent(radioInputElements[0], 'blur');

      expect(radioNativeElements[0].classList.contains('gh-radio-focused'))
        .toBeFalsy('Expected no focus ring on blur.');
    });

    it(`should update the group's selected radio to null when unchecking that radio
        programmatically`, () => {
      const changeSpy = jasmine.createSpy('radio-group change listener');
      groupInstance.change.subscribe(changeSpy);
      radioInstances[0].checked = true;

      fixture.detectChanges();

      expect(changeSpy).not.toHaveBeenCalled();
      expect(groupInstance.value).toBeTruthy();

      radioInstances[0].checked = false;

      fixture.detectChanges();

      expect(changeSpy).not.toHaveBeenCalled();
      expect(groupInstance.value).toBeFalsy();
      expect(radioInstances.every(radio => !radio.checked)).toBe(true);
      expect(groupInstance.selected).toBeNull();
    });
  });
});

@Component({
  template: `
  <gh-radio-group [disabled]="isGroupDisabled"
                  [required]="isGroupRequired"
                  [value]="groupValue"
                  name="test-name">
    <gh-radio-button value="fire" [disabled]="isFirstDisabled">Charmander</gh-radio-button>
    <gh-radio-button value="water">Squirtle</gh-radio-button>
    <gh-radio-button value="leaf">Bulbasaur</gh-radio-button>
  </gh-radio-group>
  `
})
class RadiosInsideRadioGroup {
  isFirstDisabled: boolean = false;
  isGroupDisabled: boolean = false;
  isGroupRequired: boolean = false;
  groupValue: string | null = null;
}


@Component({
  template: `
    <gh-radio-button name="season" value="spring">Spring</gh-radio-button>
    <gh-radio-button name="season" value="summer">Summer</gh-radio-button>
    <gh-radio-button name="season" value="autum">Autumn</gh-radio-button>
    <gh-radio-button name="weather" value="warm">Spring</gh-radio-button>
    <gh-radio-button name="weather" value="hot">Summer</gh-radio-button>
    <gh-radio-button name="weather" value="cool">Autumn</gh-radio-button>
    <span id="xyz">Baby Banana</span>
    <span id="abc">A smaller banana</span>
    <gh-radio-button name="fruit"
                     value="banana"
                     [aria-label]="ariaLabel"
                     [aria-labelledby]="ariaLabelledby"
                     [aria-describedby]="ariaDescribedby">
    </gh-radio-button>
    <gh-radio-button name="fruit" value="raspberry">Raspberry</gh-radio-button>
    <gh-radio-button id="nameless" value="no-name">No name</gh-radio-button>
  `
})
class StandaloneRadioButtons {
  ariaLabel: string = 'Banana';
  ariaLabelledby: string = 'xyz';
  ariaDescribedby: string = 'abc';
}
