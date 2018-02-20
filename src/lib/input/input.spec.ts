import { Component, ViewChild } from '@angular/core';
import { TestBed, fakeAsync, inject, ComponentFixture, flush } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
  FormsModule,
  ReactiveFormsModule,
  NgForm,
  FormControl,
  Validators,
  FormGroup
} from '@angular/forms';
import { PlatformModule, Platform } from '@angular/cdk/platform';
import {
  GhFormFieldModule,
  getFormFieldDuplicatedHintError,
  getFormFieldMissingControlError
} from '@dynatrace/ngx-groundhog/form-field';
import { GhInputModule } from './input-module';
import { By } from '@angular/platform-browser';
import { GhInput } from './input';

describe('GhInput without forms', () => {
  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        GhFormFieldModule,
        GhInputModule,
        NoopAnimationsModule,
        PlatformModule,
        ReactiveFormsModule,
      ],
      declarations: [
        GhInputWithDisabled,
        GhInputWithId,
        GhInputWithRequired,
        GhInputWithType,
        GhInputInvalidHintTestController,
        GhInputInvalidHint2TestController,
        GhInputMissingInputTestController,
        GhInputWithNgIf,
        GhInputHintLabelTestController,
        GhInputDateTestController,
        GhInputTextTestController,
        GhInputHintLabel2TestController,
        GhInputPlaceholderAttrTestComponent,
        GhInputMultipleHintTestController,
        GhInputTextareaWithBindings,
        GhInputMultipleHintMixedTestController,
        GhInputWithReadonlyInput
      ],
    });

    TestBed.compileComponents();
  }));


  it('should add id', fakeAsync(() => {
    let fixture = TestBed.createComponent(GhInputTextTestController);
    fixture.detectChanges();

    const inputElement: HTMLInputElement =
      fixture.debugElement.query(By.css('input')).nativeElement;
    const labelElement: HTMLInputElement =
      fixture.debugElement.query(By.css('label')).nativeElement;

    expect(inputElement.id).toBeTruthy();
    expect(inputElement.id).toEqual(labelElement.getAttribute('for')!);
  }));

  it('should add aria-owns to the label for the associated control', fakeAsync(() => {
    let fixture = TestBed.createComponent(GhInputTextTestController);
    fixture.detectChanges();

    const inputElement: HTMLInputElement =
      fixture.debugElement.query(By.css('input')).nativeElement;
    const labelElement: HTMLInputElement =
      fixture.debugElement.query(By.css('label')).nativeElement;

    expect(labelElement.getAttribute('aria-owns')).toBe(inputElement.id);
  }));

  it('should add aria-required reflecting the required state', fakeAsync(() => {
    const fixture = TestBed.createComponent(GhInputWithRequired);
    fixture.detectChanges();

    const inputElement: HTMLInputElement =
      fixture.debugElement.query(By.css('input')).nativeElement;

    expect(inputElement.getAttribute('aria-required'))
      .toBe('false', 'Expected aria-required to reflect required state of false');

    fixture.componentInstance.required = true;
    fixture.detectChanges();

    expect(inputElement.getAttribute('aria-required'))
      .toBe('true', 'Expected aria-required to reflect required state of true');
  }));

  it('should not overwrite existing id', fakeAsync(() => {
    let fixture = TestBed.createComponent(GhInputWithId);
    fixture.detectChanges();

    const inputElement: HTMLInputElement =
      fixture.debugElement.query(By.css('input')).nativeElement;
    const labelElement: HTMLInputElement =
      fixture.debugElement.query(By.css('label')).nativeElement;

    expect(inputElement.id).toBe('test-id');
    expect(labelElement.getAttribute('for')).toBe('test-id');
  }));

  // TODO @thomaspink: Add when testing files have been added
  // it('validates there\'s only one hint label per side', fakeAsync(() => {
  //   let fixture = TestBed.createComponent(GhInputInvalidHintTestController);

  //   expect(() => fixture.detectChanges())
  //   .toThrowError(wrappedErrorMessage(getFormFieldDuplicatedHintError('start')));
  // }));

  // TODO @thomaspink: Add when testing files have been added
  // it('validates there\'s only one hint label per side (attribute)', fakeAsync(() => {
  //   let fixture = TestBed.createComponent(GhInputInvalidHint2TestController);

  //   expect(() => fixture.detectChanges()).toThrowError(
  //       wrappedErrorMessage(getFormFieldDuplicatedHintError('start')));
  // }));

  // TODO @thomaspink: Add when testing files have been added
  // it('validates that ghInput child is present', fakeAsync(() => {
  //   let fixture = TestBed.createComponent(GhInputInvalidHint2TestController);

  //   expect(() => fixture.detectChanges()).toThrowError(
  //       wrappedErrorMessage(getFormFieldMissingControlError()));
  // }));

  // TODO @thomaspink: Add when testing files have been added
  // it('validates that ghInput child is present', fakeAsync(() => {
  //   let fixture = TestBed.createComponent(GhInputMissingInputTestController);

  //   expect(() => fixture.detectChanges()).toThrowError(
  //     wrappedErrorMessage(getFormFieldMissingControlError()));
  // }));

  // TODO @thomaspink: Add when testing files have been added
  // it('validates that ghInput child is present after initialization', fakeAsync(() => {
  //   let fixture = TestBed.createComponent(GhInputWithNgIf);

  //   expect(() => fixture.detectChanges()).not.toThrowError(
  //     wrappedErrorMessage(getFormFieldMissingControlError()));

  //   fixture.componentInstance.renderInput = false;

  //   expect(() => fixture.detectChanges()).toThrowError(
  //     wrappedErrorMessage(getFormFieldMissingControlError()));
  // }));

  it('supports hint labels attribute', fakeAsync(() => {
    let fixture = TestBed.createComponent(GhInputHintLabelTestController);
    fixture.detectChanges();

    // If the hint label is empty, expect no label.
    expect(fixture.debugElement.query(By.css('.gh-hint'))).toBeNull();

    fixture.componentInstance.label = 'label';
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.gh-hint'))).not.toBeNull();
  }));

  it('sets an id on hint labels', fakeAsync(() => {
    let fixture = TestBed.createComponent(GhInputHintLabelTestController);

    fixture.componentInstance.label = 'label';
    fixture.detectChanges();

    let hint = fixture.debugElement.query(By.css('.gh-hint')).nativeElement;

    expect(hint.getAttribute('id')).toBeTruthy();
  }));

  it('supports hint labels elements', fakeAsync(() => {
    let fixture = TestBed.createComponent(GhInputHintLabel2TestController);
    fixture.detectChanges();

    // In this case, we should have an empty <gh-hint>.
    let el = fixture.debugElement.query(By.css('gh-hint')).nativeElement;
    expect(el.textContent).toBeFalsy();

    fixture.componentInstance.label = 'label';
    fixture.detectChanges();
    el = fixture.debugElement.query(By.css('gh-hint')).nativeElement;
    expect(el.textContent).toBe('label');
  }));

  it('supports placeholder attribute', fakeAsync(() => {
    let fixture = TestBed.createComponent(GhInputPlaceholderAttrTestComponent);
    fixture.detectChanges();

    let inputEl = fixture.debugElement.query(By.css('input')).nativeElement;
    expect(inputEl.placeholder).toBe('');

    fixture.componentInstance.placeholder = 'Other placeholder';
    fixture.detectChanges();
    expect(inputEl.placeholder).toBe('Other placeholder');
  }));

  it('supports the disabled attribute as binding', fakeAsync(() => {
    const fixture = TestBed.createComponent(GhInputWithDisabled);
    fixture.detectChanges();

    const formFieldEl =
      fixture.debugElement.query(By.css('.gh-form-field')).nativeElement;
    const inputEl = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(formFieldEl.classList.contains('gh-form-field-disabled'))
      .toBe(false, `Expected form field not to start out disabled.`);
    expect(inputEl.disabled).toBe(false);

    fixture.componentInstance.disabled = true;
    fixture.detectChanges();

    expect(formFieldEl.classList.contains('gh-form-field-disabled'))
      .toBe(true, `Expected form field to look disabled after property is set.`);
    expect(inputEl.disabled).toBe(true);
  }));

  it('supports the required attribute as binding', fakeAsync(() => {
    let fixture = TestBed.createComponent(GhInputWithRequired);
    fixture.detectChanges();

    let inputEl = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(inputEl.required).toBe(false);

    fixture.componentInstance.required = true;
    fixture.detectChanges();

    expect(inputEl.required).toBe(true);
  }));

  it('supports the type attribute as binding', fakeAsync(() => {
    let fixture = TestBed.createComponent(GhInputWithType);
    fixture.detectChanges();

    let inputEl = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(inputEl.type).toBe('text');

    fixture.componentInstance.type = 'password';
    fixture.detectChanges();

    expect(inputEl.type).toBe('password');
  }));

  it('supports textarea', fakeAsync(() => {
    let fixture = TestBed.createComponent(GhInputTextareaWithBindings);
    fixture.detectChanges();

    const textarea: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
    expect(textarea).not.toBeNull();
  }));

  it('sets the aria-describedby when a hintLabel is set', fakeAsync(() => {
    let fixture = TestBed.createComponent(GhInputHintLabelTestController);

    fixture.componentInstance.label = 'label';
    fixture.detectChanges();

    let hint = fixture.debugElement.query(By.css('.gh-hint')).nativeElement;
    let input = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(input.getAttribute('aria-describedby')).toBe(hint.getAttribute('id'));
  }));

  it('sets the aria-describedby to the id of the gh-hint', fakeAsync(() => {
    let fixture = TestBed.createComponent(GhInputHintLabel2TestController);

    fixture.componentInstance.label = 'label';
    fixture.detectChanges();

    let hint = fixture.debugElement.query(By.css('.gh-hint')).nativeElement;
    let input = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(input.getAttribute('aria-describedby')).toBe(hint.getAttribute('id'));
  }));

  it('sets the aria-describedby with multiple gh-hint instances', fakeAsync(() => {
    let fixture = TestBed.createComponent(GhInputMultipleHintTestController);

    fixture.componentInstance.startId = 'start';
    fixture.componentInstance.endId = 'end';
    fixture.detectChanges();

    let input = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(input.getAttribute('aria-describedby')).toBe('start end');
  }));

  it('sets the aria-describedby when a hintLabel is set, in addition to a gh-hint',
    fakeAsync(() => {
      let fixture = TestBed.createComponent(GhInputMultipleHintMixedTestController);

      fixture.detectChanges();

      let hintLabel = fixture.debugElement.query(By.css('.gh-hint:not(.gh-right)')).nativeElement;
      let endLabel = fixture.debugElement.query(By.css('.gh-hint.gh-hint-right')).nativeElement;
      let input = fixture.debugElement.query(By.css('input')).nativeElement;
      let ariaValue = input.getAttribute('aria-describedby');

      expect(ariaValue).toBe(`${hintLabel.getAttribute('id')} ${endLabel.getAttribute('id')}`);
    }));

  it('should set the focused class when the input is focused', fakeAsync(() => {
    let fixture = TestBed.createComponent(GhInputTextTestController);
    fixture.detectChanges();

    let input = fixture.debugElement.query(By.directive(GhInput))
      .injector.get<GhInput>(GhInput);
    let container = fixture.debugElement.query(By.css('gh-form-field')).nativeElement;

    // Call the focus handler directly to avoid flakyness where
    // browsers don't focus elements if the window is minimized.
    input._focusChanged(true);
    fixture.detectChanges();

    expect(container.classList).toContain('gh-focused');
  }));

  it('should remove the focused class if the input becomes disabled while focused',
    fakeAsync(() => {
      const fixture = TestBed.createComponent(GhInputTextTestController);
      fixture.detectChanges();

      const input = fixture.debugElement.query(By.directive(GhInput)).injector.get(GhInput);
      const container = fixture.debugElement.query(By.css('gh-form-field')).nativeElement;

      // Call the focus handler directly to avoid flakyness where
      // browsers don't focus elements if the window is minimized.
      input._focusChanged(true);
      fixture.detectChanges();

      expect(container.classList).toContain('gh-focused');

      input.disabled = true;
      fixture.detectChanges();

      expect(container.classList).not.toContain('gh-focused');
    }));

  it('should not highlight when focusing a readonly input', fakeAsync(() => {
    let fixture = TestBed.createComponent(GhInputWithReadonlyInput);
    fixture.detectChanges();

    let input = fixture.debugElement.query(By.directive(GhInput)).injector.get<GhInput>(GhInput);
    let container = fixture.debugElement.query(By.css('gh-form-field')).nativeElement;

    // Call the focus handler directly to avoid flakyness where
    // browsers don't focus elements if the window is minimized.
    input._focusChanged(true);
    fixture.detectChanges();

    expect(input.focused).toBe(false);
    expect(container.classList).not.toContain('gh-focused');
  }));

});

describe('GhInput with forms', () => {

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        GhFormFieldModule,
        GhInputModule,
        NoopAnimationsModule,
        PlatformModule,
        ReactiveFormsModule,
      ],
      declarations: [
        GhInputWithFormErrorMessages
      ],
    });

    TestBed.compileComponents();
  }));

  describe('error messages', () => {
    let fixture: ComponentFixture<GhInputWithFormErrorMessages>;
    let testComponent: GhInputWithFormErrorMessages;
    let containerEl: HTMLElement;
    let inputEl: HTMLElement;

    beforeEach(fakeAsync(() => {
      fixture = TestBed.createComponent(GhInputWithFormErrorMessages);
      fixture.detectChanges();
      testComponent = fixture.componentInstance;
      containerEl = fixture.debugElement.query(By.css('gh-form-field')).nativeElement;
      inputEl = fixture.debugElement.query(By.css('input')).nativeElement;
    }));

    it('should not show any errors if the user has not interacted', fakeAsync(() => {
      expect(testComponent.formControl.untouched).toBe(true, 'Expected untouched form control');
      expect(containerEl.querySelectorAll('gh-error').length).toBe(0, 'Expected no error message');
      expect(inputEl.getAttribute('aria-invalid'))
        .toBe('false', 'Expected aria-invalid to be set to "false".');
    }));

    it('should display an error message when the input is touched and invalid', fakeAsync(() => {
      expect(testComponent.formControl.invalid).toBe(true, 'Expected form control to be invalid');
      expect(containerEl.querySelectorAll('gh-error').length).toBe(0, 'Expected no error message');

      testComponent.formControl.markAsTouched();
      fixture.detectChanges();
      flush();

      expect(containerEl.classList)
        .toContain('gh-form-field-invalid', 'Expected container to have the invalid CSS class.');
      expect(containerEl.querySelectorAll('gh-error').length)
        .toBe(1, 'Expected one error message to have been rendered.');
      expect(inputEl.getAttribute('aria-invalid'))
        .toBe('true', 'Expected aria-invalid to be set to "true".');
    }));

    // tslint:disable:max-line-length
    // TODO @thomaspink: Add when testing files have been added
    // it('should display an error message when the parent form is submitted', fakeAsync(() => {
    //   expect(testComponent.form.submitted)
    //     .toBe(false, 'Expected form not to have been submitted');
    //   expect(testComponent.formControl.invalid)
    //     .toBe(true, 'Expected form control to be invalid');
    //   expect(containerEl.querySelectorAll('gh-error').length)
    //     .toBe(0, 'Expected no error message');

    //   dispatchFakeEvent(fixture.debugElement.query(By.css('form')).nativeElement, 'submit');
    //   fixture.detectChanges();
    //   flush();

    //   expect(testComponent.form.submitted).toBe(true, 'Expected form to have been submitted');
    //   expect(containerEl.classList)
    //     .toContain('gh-form-field-invalid', 'Expected container to have the invalid CSS class.');
    //   expect(containerEl.querySelectorAll('gh-error').length)
    //     .toBe(1, 'Expected one error message to have been rendered.');
    //   expect(inputEl.getAttribute('aria-invalid'))
    //     .toBe('true', 'Expected aria-invalid to be set to "true".');
    // }));

    // TODO @thomaspink: Add when testing files have been added
    // it('should display an error message when the parent form group is submitted', fakeAsync(() => {
    //   fixture.destroy();

    //   let groupFixture = TestBed.createComponent(GhInputWithFormGroupErrorMessages);
    //   let component: GhInputWithFormGroupErrorMessages;

    //   groupFixture.detectChanges();
    //   component = groupFixture.componentInstance;
    //   containerEl = groupFixture.debugElement.query(By.css('gh-form-field')).nativeElement;
    //   inputEl = groupFixture.debugElement.query(By.css('input')).nativeElement;

    //   expect(component.formGroup.invalid).toBe(true, 'Expected form control to be invalid');
    //   expect(containerEl.querySelectorAll('gh-error').length).toBe(0, 'Expected no error message');
    //   expect(inputEl.getAttribute('aria-invalid'))
    //     .toBe('false', 'Expected aria-invalid to be set to "false".');
    //   expect(component.formGroupDirective.submitted)
    //     .toBe(false, 'Expected form not to have been submitted');

    //   dispatchFakeEvent(groupFixture.debugElement.query(By.css('form')).nativeElement, 'submit');
    //   groupFixture.detectChanges();
    //   flush();

    //   expect(component.formGroupDirective.submitted)
    //     .toBe(true, 'Expected form to have been submitted');
    //   expect(containerEl.classList)
    //     .toContain('gh-form-field-invalid', 'Expected container to have the invalid CSS class.');
    //   expect(containerEl.querySelectorAll('gh-error').length)
    //     .toBe(1, 'Expected one error message to have been rendered.');
    //   expect(inputEl.getAttribute('aria-invalid'))
    //     .toBe('true', 'Expected aria-invalid to be set to "true".');
    // }));
    // tslint:enable:max-line-length

    it('should hide the errors once the input becomes valid', fakeAsync(() => {
      testComponent.formControl.markAsTouched();
      fixture.detectChanges();
      flush();

      expect(containerEl.classList)
        .toContain('gh-form-field-invalid', 'Expected container to have the invalid CSS class.');
      expect(containerEl.querySelectorAll('gh-error').length)
        .toBe(1, 'Expected one error message to have been rendered.');

      testComponent.formControl.setValue('something');
      fixture.detectChanges();
      flush();

      expect(containerEl.classList).not.toContain('gh-form-field-invalid',
        'Expected container not to have the invalid class when valid.');
      expect(containerEl.querySelectorAll('gh-error').length)
        .toBe(0, 'Expected no error messages when the input is valid.');
    }));

    it('should set the proper role on the error messages', fakeAsync(() => {
      testComponent.formControl.markAsTouched();
      fixture.detectChanges();

      expect(containerEl.querySelector('gh-error')!.getAttribute('role')).toBe('alert');
    }));

    it('sets the aria-describedby to reference errors when in error state', fakeAsync(() => {
      let hintId = fixture.debugElement.query(By.css('.gh-hint')).nativeElement.getAttribute('id');
      let describedBy = inputEl.getAttribute('aria-describedby');

      expect(hintId).toBeTruthy('hint should be shown');
      expect(describedBy).toBe(hintId);

      fixture.componentInstance.formControl.markAsTouched();
      fixture.detectChanges();

      let errorIds = fixture.debugElement.queryAll(By.css('.gh-error'))
        .map(el => el.nativeElement.getAttribute('id')).join(' ');
      describedBy = inputEl.getAttribute('aria-describedby');

      expect(errorIds).toBeTruthy('errors should be shown');
      expect(describedBy).toBe(errorIds);
    }));

  });
});

@Component({
  template: `
    <gh-form-field>
      <gh-label>test</gh-label>
      <input ghInput id="test-id" placeholder="test">
    </gh-form-field>`
})
class GhInputWithId { }

@Component({
  template: `<gh-form-field><input ghInput [disabled]="disabled"></gh-form-field>`
})
class GhInputWithDisabled {
  disabled: boolean;
}

@Component({
  template: `<gh-form-field><input ghInput [required]="required"></gh-form-field>`
})
class GhInputWithRequired {
  required: boolean;
}

@Component({
  template: `<gh-form-field><input ghInput [type]="type"></gh-form-field>`
})
class GhInputWithType {
  type: string;
}

@Component({
  template: `
    <gh-form-field>
      <input ghInput>
      <gh-hint>Hello</gh-hint>
      <gh-hint>World</gh-hint>
    </gh-form-field>`
})
class GhInputInvalidHintTestController { }

@Component({
  template: `
    <gh-form-field hintLabel="Hello">
      <input ghInput>
      <gh-hint>World</gh-hint>
    </gh-form-field>`
})
class GhInputInvalidHint2TestController { }

@Component({
  template: `<gh-form-field><input></gh-form-field>`
})
class GhInputMissingInputTestController { }

@Component({
  template: `
    <gh-form-field>
      <input ghInput *ngIf="renderInput">
    </gh-form-field>
  `
})
class GhInputWithNgIf {
  renderInput = true;
}

@Component({
  template: `<gh-form-field [hintLabel]="label"><input ghInput></gh-form-field>`
})
class GhInputHintLabelTestController {
  label: string = '';
}

@Component({
  template: `
    <gh-form-field>
      <input ghInput type="date" placeholder="Placeholder">
    </gh-form-field>`
})
class GhInputDateTestController { }

@Component({
  template: `
    <gh-form-field>
      <gh-label>test</gh-label>
      <input ghInput type="text" placeholder="Placeholder">
    </gh-form-field>`
})
class GhInputTextTestController { }

@Component({
  template: `
    <gh-form-field>
      <input ghInput>
      <gh-hint>{{label}}</gh-hint>
    </gh-form-field>`
})
class GhInputHintLabel2TestController {
  label: string = '';
}

@Component({
  template: `
    <gh-form-field>
      <input ghInput [placeholder]="placeholder">
    </gh-form-field>`
})
class GhInputPlaceholderAttrTestComponent {
  placeholder: string = '';
}

@Component({
  template: `
    <gh-form-field>
      <input ghInput>
      <gh-hint align="start" [id]="startId">Hello</gh-hint>
      <gh-hint align="end" [id]="endId">World</gh-hint>
    </gh-form-field>`
})
class GhInputMultipleHintTestController {
  startId: string;
  endId: string;
}

@Component({
  template: `
    <gh-form-field>
      <textarea ghInput [rows]="rows" [cols]="cols" [wrap]="wrap" placeholder="Snacks"></textarea>
    </gh-form-field>`
})
class GhInputTextareaWithBindings {
  rows: number = 4;
  cols: number = 8;
  wrap: string = 'hard';
}

@Component({
  template: `
    <gh-form-field hintLabel="Hello">
      <input ghInput>
      <gh-hint align="end">World</gh-hint>
    </gh-form-field>`
})
class GhInputMultipleHintMixedTestController { }

@Component({
  template: `
    <gh-form-field>
      <input ghInput readonly value="Only for reading">
    </gh-form-field>
  `
})
class GhInputWithReadonlyInput { }

@Component({
  template: `
    <form #form="ngForm" novalidate>
      <gh-form-field>
        <input ghInput [formControl]="formControl">
        <gh-hint>Please type something</gh-hint>
        <gh-error *ngIf="renderError">This field is required</gh-error>
      </gh-form-field>
    </form>
  `
})
class GhInputWithFormErrorMessages {
  @ViewChild('form') form: NgForm;
  formControl = new FormControl('', Validators.required);
  renderError = true;
}

@Component({
  template: `
    <form [formGroup]="formGroup">
      <gh-form-field>
        <input ghInput
            formControlName="name"
            [errorStateMatcher]="customErrorStateMatcher">
        <gh-hint>Please type something</gh-hint>
        <gh-error>This field is required</gh-error>
      </gh-form-field>
    </form>
  `
})
class GhInputWithCustomErrorStateMatcher {
  formGroup = new FormGroup({
    name: new FormControl('', Validators.required)
  });

  errorState = false;

  customErrorStateMatcher = {
    isErrorState: () => this.errorState
  };
}
