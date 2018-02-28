import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormControl, FormsModule, NgModel, ReactiveFormsModule } from '@angular/forms';
import { Component, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { GhRadioButton, GhRadioChange, GhRadioGroup, GhRadioModule } from './index';


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

    // it('should coerce the disabled binding on the radio group', () => {
    //   (groupInstance as any).disabled = '';
    //   fixture.detectChanges();

    //   radioLabelElements[0].click();
    //   fixture.detectChanges();

    //   expect(radioInstances[0].checked).toBe(false);
    //   expect(groupInstance.disabled).toBe(true);
    // });

    // it('should disable click interaction when the group is disabled', () => {
    //   testComponent.isGroupDisabled = true;
    //   fixture.detectChanges();

    //   radioLabelElements[0].click();
    //   fixture.detectChanges();

    //   expect(radioInstances[0].checked).toBe(false);
    // });
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
