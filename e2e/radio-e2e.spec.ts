import {browser, by, element, ExpectedConditions} from 'protractor';

describe('radio', () => {
  describe('disabling behavior', () => {
    beforeEach(() => browser.get('/radio'));

    it('should be checked when clicked', async () => {
      element(by.id('water')).click();

      expect(element(by.id('water')).getAttribute('class')).toContain('gh-radio-checked');

      expect(element(by.css('input[id=water-input]')).getAttribute('checked')).toBeTruthy();
      expect(element(by.css('input[id=leaf-input]')).getAttribute('checked')).toBeFalsy();

      element(by.id('leaf')).click();
      expect(element(by.id('leaf')).getAttribute('class')).toContain('gh-radio-checked');

      expect(element(by.css('input[id=leaf-input]')).getAttribute('checked')).toBeTruthy();
      expect(element(by.css('input[id=water-input]')).getAttribute('checked')).toBeFalsy();
    });

    it('should be disabled when disable the radio group', async () => {
      element(by.id('toggle-disable')).click();
      element(by.id('water')).click();

      expect(element(by.id('water')).getAttribute('class')).toContain('gh-radio-disabled');

      await browser.wait(ExpectedConditions.presenceOf(element(by.css('.gh-radio-disabled'))));

      expect(element(by.css('input[id=water-input]')).getAttribute('disabled')).toBeTruthy();

      element(by.id('leaf')).click();
      expect(element(by.id('leaf')).getAttribute('class')).toContain('gh-radio-disabled');

      expect(element(by.css('input[id=leaf-input]')).getAttribute('disabled')).toBeTruthy();
    });

  });

});
