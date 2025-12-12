import { Component, OnInit } from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule, ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import {AuthService} from "../../../../core/services/auth.service";
import {ToastrService} from "ngx-toastr";
import {LocalStorageService} from "../../../../core/services/localstorage.service";
import {NgClass, NgIf} from "@angular/common";
import {SvgIconComponent} from "angular-svg-icon";

const confirmPasswordValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  return control.value.password === control.value.confirmPassword
    ? null
    : { PasswordNoMatch: true };
};

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  standalone: true,
  imports: [FormsModule, RouterLink, ButtonComponent, ReactiveFormsModule, NgIf, NgClass, SvgIconComponent],
})
export class ForgotPasswordComponent implements OnInit {
  form!: FormGroup;
  formToken!: FormGroup;
  isLoading = false;
  submitted = false;
  submittedToken = false;
  sendEmail = false;
  resetEmail = "";

  passwordTextType2!: boolean;
  passwordTextType1!: boolean;

  constructor(private readonly _formBuilder: FormBuilder, private readonly _router: Router, private authService: AuthService, private toastr: ToastrService) {}


  ngOnInit(): void {
    this.form = this._formBuilder.group({
      email: ['', [Validators.email, Validators.required]],
    });
    this.formToken = this._formBuilder.group({
      token: ['', [Validators.required]],
      password: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]],
    }, { validators: confirmPasswordValidator});
  }
  get f() {
    return this.form.controls;
  }
  get fToken() {
    return this.formToken.controls;
  }
  onSubmit() {
    this.markAllAsTouched();
    this.submitted = true;
    this.isLoading = true
    const {email} = this.form.value;

    // stop here if form is invalid
    if (this.form.invalid) {
      this.isLoading = false
      return;
    }
    this.authService.forgetPassword(email).subscribe({
      next: (res) => {
        this.sendEmail = true
        this.resetEmail = email
        if (res.status) {
          this.isLoading = false
        } else {
          this.isLoading = false
          this.toastr.warning('Vérifier vos données', 'Vérification', {
            timeOut: 1500
          })
        }
      }, error: error => {
        this.isLoading = false;
      }
    })
  }
  onSubmitToken() {
    this.markAllTokenAsTouched();
    this.submittedToken = true;
    this.isLoading = true
    const {password, token} = this.formToken.value;

    // stop here if form is invalid
    if (this.formToken.invalid) {
      this.isLoading = false
      return;
    }
    this.authService.resetPassword(password, token).subscribe({
      next: (res) => {
        if (res.status) {
          this.isLoading = false
          this._router.navigate(['/admin985xilinp/auth/sign-in']);
        } else {
          this.isLoading = false
          this.toastr.warning('Vérifier vos données', 'Vérification', {
            timeOut: 1500
          })
        }
      }, error: error => {
        this.isLoading = false;
        this.toastr.error('Erreur interne du serveur', 'Erreur', {
          timeOut: 1500
        })
      }
    })
  }
  togglePasswordTextType(int: number) {
    if(int === 1) { this.passwordTextType1 = !this.passwordTextType1}
    if(int === 2) { this.passwordTextType2 = !this.passwordTextType2}
  }
  markAllAsTouched() {
    Object.keys(this.form.controls).forEach((key) => {
      this.form.get(key)?.markAsTouched();
    });
  }
  markAllTokenAsTouched() {
    Object.keys(this.formToken.controls).forEach((key) => {
      this.formToken.get(key)?.markAsTouched();
    });
  }
}
