import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { LocalStorageService } from 'src/app/core/services/localstorage.service';
import { AppPhoneNumberDirective } from 'src/app/shared/directives/app-phone-number.directive';
import { MainLoaderComponent } from "../../components/loader/loader.component";
import { NgxMaterialIntlTelInputComponent, TextLabels } from 'ngx-material-intl-tel-input';
@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, AppPhoneNumberDirective, MainLoaderComponent, NgxMaterialIntlTelInputComponent, RouterModule],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss'
})
export class SignUpComponent {
  registerForm: FormGroup
  activationKeyForm: FormGroup
  validKey = false
  isOpen = false
  hideConfirmPassword = false
  hidePassword = false
  passwordNotMatched = false
  isLoading = true
  handleError = false
  handleResponse = false
  handleErrorResponse = false
  role: string | undefined
  key: string | undefined
  textLabels: TextLabels = {
    codePlaceholder: "",
    hintLabel: "",
    invalidNumberError: "",
    nationalNumberLabel: "Numéro de téléphone",
    noEntriesFoundLabel: "",
    requiredError: "",
    searchPlaceholderLabel: "",
    mainLabel: ''}
  constructor(
    private router: Router,
    private authService: AuthService,
    private localStorageService: LocalStorageService,
    private fb: FormBuilder) {

    this.activationKeyForm = this.fb.group({
      key: [null, [Validators.required]],
    });

    this.registerForm = this.fb.group({
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required, this.passwordPatternValidator()]],
      confirmPassword: [null, Validators.required],
      gender: ['Male'],
      firstName: [null, Validators.required],
      lastName: [null, Validators.required],
      tel: [null, Validators.required],
      profession: [{ value: 'PHARMACIST', disabled: true }],
      birthday: [null, Validators.required],
    });

  }

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.router.navigateByUrl('/profil');
    }
    this.isLoading = false
  }

  passwordPatternValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
      return pattern.test(control.value) ? null : { passwordInvalid: true };
    };
  }

  markAllAsTouched() {
    Object.keys(this.registerForm.controls).forEach(key => {
      this.registerForm.get(key)?.markAsTouched();
    });
  }

  markAllAsTouchedKeyForm() {
    Object.keys(this.activationKeyForm.controls).forEach(key => {
      this.activationKeyForm.get(key)?.markAsTouched();
    });
  }

  openCalendar() {
    const birthDayInput = document.getElementById('birthday') as HTMLInputElement;
    birthDayInput ? birthDayInput.showPicker() : null
  }

  togglePassword() {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfirmPassword() {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }

  resetAlerts() {
    this.handleError = false;
    this.handleResponse = false;
    this.handleErrorResponse = false
  }

  getAlertMessage(): string {
    if (this.handleResponse) return ' Vérifier la clé d\'activation';
    return 'Une erreur s\'est produite';
  }

  getAlertMessageRegister(): string {
    if (this.handleResponse) return 'Votre compte a été créé avec succès.';
    if (this.handleErrorResponse) return 'Cet e-mail est déjà utilisé.';
    return 'Une erreur s\'est produite';
  }

  closeAlert() {
    this.resetAlerts();
  }


  keyCheck() {
    this.resetAlerts();
    this.markAllAsTouchedKeyForm();
    // stop here if form is invalid
    if (this.activationKeyForm.invalid) {
      return;
    }

    this.isLoading = true
    const data = this.activationKeyForm.value
    this.authService.verifyKey(data).subscribe({
      next: (res) => {
        if (res.status) {
          this.closeAlert()
          this.validKey = true
          this.key = res.data.pharmacyUser.key
          this.registerForm.controls['profession'].setValue(res.data.pharmacyUser.role);
        } else {
          this.handleResponse = true
        }
        this.isLoading = false
      }, error: error => {
        this.handleError = true
        this.isLoading = false
      }
    })
  }

  onSubmit() {
    this.markAllAsTouched();
    // stop here if form is invalid
    if (this.registerForm.invalid) {
      return;
    }

    const { password, confirmPassword } = this.registerForm.controls;
    if (password.value !== confirmPassword.value) {
      this.passwordNotMatched = true;
      return;
    }

    this.isLoading = true
    const { confirmPassword: _, ...data } = this.registerForm.value;
    // const data = this.registerForm.value
    this.authService.register({key: this.key, ...data}).subscribe({
      next: (res) => {
        if (res.status) {
          this.passwordNotMatched = false
          this.handleResponse = true
          const user = {
            token: res.data.token,
            ...res.data.user
          }
          // if(!remember) this.localStorageService.setOurStorage(sessionStorage);
          this.localStorageService.setItem('user', user);
          this.router.navigate(['/notre-plateforme/cours'])
        } else {
          this.handleErrorResponse = true
          console.error(res)
        }
        this.isLoading = false
      }, error: error => {
        this.handleError = true
        this.isLoading = false
      }
    })
  }

}
