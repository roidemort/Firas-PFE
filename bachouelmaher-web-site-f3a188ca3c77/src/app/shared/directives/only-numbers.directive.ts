import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appOnlyNumbers]',
  standalone: true  // Make it standalone
})
export class OnlyNumbersDirective {
  @HostListener('input', ['$event']) onInputChange(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    let sanitizedValue = input.value.replace(/[^0-9]/g, '');
    if (sanitizedValue !== input.value) {
      input.value = sanitizedValue;
      input.dispatchEvent(new Event('input'));
    }
  }
}
