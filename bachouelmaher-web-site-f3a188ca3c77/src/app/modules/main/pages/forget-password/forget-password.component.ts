import {Component} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators} from "@angular/forms";
import {Router, RouterModule} from "@angular/router";
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/core/services/auth.service';
import { MainLoaderComponent } from '../../components/loader/loader.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-forget-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MainLoaderComponent, RouterModule],
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.scss']
})
export class ForgetPasswordComponent {
  form: FormGroup;
  formReset: FormGroup;
  isLoading = true;
  secondStep = false;
  hidePassword = false;
  hideConfirmPassword = false;
  passwordNotMatched = false;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService,
    private toastr: ToastrService
  ) {
    this.form = this.fb.group({
      email: [null, [Validators.required, Validators.email]]
    });
    this.formReset = this.fb.group({
      token: [null, [Validators.required]],
      password: [null, [Validators.required, this.passwordPatternValidator()]],
      confirmPassword: [null, [Validators.required]],
    });
  }

  ngOnInit() {
    if(this.authService.isAuthenticated()){
      this.router.navigateByUrl('/profil')
    }
    this.isLoading = false;
  }

  togglePassword() {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfirmPassword() {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }

  passwordPatternValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
      return pattern.test(control.value) ? null : { passwordInvalid: true };
    };
  }

  markAllAsTouched() {
    Object.keys(this.form.controls).forEach(key => {
      this.form.get(key)?.markAsTouched();
    });
  }

  markAllAsTouchedReset() {
    Object.keys(this.formReset.controls).forEach(key => {
      this.formReset.get(key)?.markAsTouched();
    });
  }

  onSubmit() {
    this.markAllAsTouched();
    // stop here if form is invalid
    if (this.form.invalid) {
      return;
    }
    this.isLoading = true;
    const { email } = this.form.value;
    this.authService.forgetPassword(email).subscribe({
      next: (res) => {
        if (res.status) {
          this.secondStep = true
        } else {
          this.isLoading = false;
          this.toastr.warning('Vérifier votre email', 'Vérification', {
            timeOut: 1500
          })
        }
      }, error: error => {
        this.isLoading = false;
      }
    })
  }

  resetPassword() {
    this.markAllAsTouchedReset();
    // stop here if form is invalid
    if (this.formReset.invalid) {
      return;
    }

    const { password: passwordControl, confirmPassword } = this.formReset.controls;
    if (passwordControl.value !== confirmPassword.value) {
      this.passwordNotMatched = true;
      return;
    }

    this.passwordNotMatched = false
    this.isLoading = true
    const { password, token } = this.formReset.value;
    this.authService.resetPassword(password, token).subscribe({
      next: (res) => {
        if (res.status) {
          this.router.navigateByUrl('/profil');
        }
        this.isLoading = false;
      }, error: error => {
        this.isLoading = false;
      }
    })
  }
}
