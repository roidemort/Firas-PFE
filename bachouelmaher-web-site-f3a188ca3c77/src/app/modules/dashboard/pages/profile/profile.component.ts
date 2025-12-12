import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import {NgClass, NgIf} from '@angular/common';
import { AngularSvgIconModule } from 'angular-svg-icon';
import {UsersService} from "../../../../core/services/users.service";
import {AuthService} from "../../../../core/services/auth.service";

const confirmPasswordValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  return control.value.newPassword === control.value.confirmPassword
    ? null
    : { PasswordNoMatch: true };
};

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    AngularSvgIconModule,
    NgClass,
  ],
})

export class ProfileComponent {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  passwordTextType1!: boolean;
  passwordTextType2!: boolean;
  passwordTextType3!: boolean;
  isLoading = false
  constructor(
    private fb: FormBuilder,
    private usersService: UsersService,
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router
  ) {

    this.profileForm = this.fb.group({
      firstName: [this.authService.getUser().firstName, [Validators.required]],
      lastName: [this.authService.getUser().lastName, [Validators.required]],
      email: [this.authService.getUser().email, [Validators.email, Validators.required]],
      gender: [this.authService.getUser().gender, [Validators.required]],
      tel: [this.authService.getUser().tel, [Validators.required]],
      birthday: [this.authService.getUser().birthday, [Validators.required]],
    });
    this.passwordForm = this.fb.group({
      password: ["", [Validators.required]],
      newPassword: ["", [Validators.required]],
      confirmPassword: ["", [Validators.required]],
    }, { validators: confirmPasswordValidator });
  }

  markAllAsTouched() {
    Object.keys(this.profileForm.controls).forEach((key) => {
      this.profileForm.get(key)?.markAsTouched();
    });
  }

  markAllPasswordAsTouched() {
    Object.keys(this.passwordForm.controls).forEach((key) => {
      this.passwordForm.get(key)?.markAsTouched();
    });
  }

  onSubmit() {
    this.isLoading = true
    this.markAllAsTouched();
    if (this.profileForm.valid) {
      const data = {
        email: this.profileForm.controls['email'].value,
        firstName: this.profileForm.controls['firstName'].value,
        lastName: this.profileForm.controls['lastName'].value,
        gender: this.profileForm.controls['gender'].value,
        tel: this.profileForm.controls['tel'].value,
        birthday: this.profileForm.controls['birthday'].value,
      };
      this.updateProfile(data);
    } else {
      this.isLoading = false
      return
    }
  }
  onSubmitPassword() {
    this.markAllPasswordAsTouched();
    if (this.passwordForm.valid) {
      const data = {
        newPassword: this.passwordForm.controls['newPassword'].value,
        password: this.passwordForm.controls['password'].value
      };

      this.updatePasswordFn(data);
    } else {
      this.isLoading = false
      return
    }
  }

  updateProfile(data :any){
    this.usersService.updateProfile(data).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.toastr.success('Modification réussie', 'Succès', {
            timeOut: 1500,
          });
          this.isLoading = false
          this.authService.setUser(res.data.user)
          this.authService.currentUserSubject.next(res.data.user);
          this.router.navigateByUrl('/admin985xilinp/dashboard');
        }
        else {
          this.isLoading = false
          this.toastr.warning('Vérifier vos données', 'Vérification', {
            timeOut: 1500
          })
        }
      },
      error: error => {
        this.isLoading = false
        this.toastr.error('Erreur interne du serveur', 'Erreur', {
          timeOut: 1500
        })
      }
    });
  }
  updatePasswordFn(data :any){
    this.isLoading = true
    this.usersService.updatePassword(data).subscribe({
      next: (res: any) => {
        this.isLoading = false
        if (res.status) {
          this.toastr.success('Modification réussie', 'Succès', {
            timeOut: 1500,
          });
          localStorage.setItem('LOGGED_USER', JSON.stringify(res.data.user))
          this.router.navigateByUrl('/admin985xilinp/dashboard');
        }
        else {
          this.isLoading = false
          this.toastr.warning('Vérifier vos données', 'Vérification', {
            timeOut: 1500
          })
        }
      },
      error: error => {
        this.isLoading = false
        this.toastr.error('Erreur interne du serveur', 'Erreur', {
          timeOut: 1500
        })
      }
    });
  }
  togglePasswordTextType(int: number) {
    if(int === 1) { this.passwordTextType1 = !this.passwordTextType1}
    if(int === 2) { this.passwordTextType2 = !this.passwordTextType2}
    if(int === 3) { this.passwordTextType3 = !this.passwordTextType3}
  }
}

