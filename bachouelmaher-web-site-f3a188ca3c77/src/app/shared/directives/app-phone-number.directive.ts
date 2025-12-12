import { Directive, HostListener, ElementRef } from '@angular/core';

@Directive({
  selector: '[AppPhoneNumber]',
  standalone: true
})
export class AppPhoneNumberDirective {
  private readonly prefix = '+';

  constructor(private el: ElementRef) {
    // Initialisation de la valeur du champ avec le préfixe
    if (!this.el.nativeElement.value.startsWith(this.prefix)) {
      this.el.nativeElement.value = this.prefix;
    }
  }

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = this.el.nativeElement;

    // Ne permet que les chiffres après le +
    const newValue = input.value.replace(/[^0-9]/g, '');
    input.value = this.prefix + newValue.slice(0); // Conserve le préfixe et ajoute les chiffres
  }

  @HostListener('focus', ['$event'])
  onFocus(): void {
    const input = this.el.nativeElement;
    // Si le champ a le focus et ne commence pas par le préfixe, le remettre
    if (!input.value.startsWith(this.prefix)) {
      input.value = this.prefix;
    }
  }

  @HostListener('blur', ['$event'])
  onBlur(): void {
    const input = this.el.nativeElement;
    // Si la valeur ne commence pas par le préfixe, le remettre
    if (!input.value.startsWith(this.prefix)) {
      input.value = this.prefix;
    }
  }

}
