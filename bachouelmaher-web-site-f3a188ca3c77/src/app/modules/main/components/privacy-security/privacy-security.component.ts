import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ValidatorFn, AbstractControl, ValidationErrors, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Validators } from 'ngx-editor';
import { UsersService } from 'src/app/core/services/users.service';
import { AlertComponent } from '../alert/alert.component';

@Component({
  selector: 'app-privacy-security',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AlertComponent],
  templateUrl: './privacy-security.component.html',
  styleUrl: './privacy-security.component.scss'
})
export class PrivacySecurityComponent {
  resetForm: FormGroup
  hideConfirmPassword = false
  hidePassword = false
  hideOldPassword = false
  passwordNotMatched = false
  handleErrorResponse = false;
  handleResponse = false;
  handleError = false;
  isLoading = true
  alertMessage = ''; 

  constructor(private fb: FormBuilder, private userService: UsersService) {
    this.resetForm = this.fb.group({
      oldPassword: [null, [Validators.required]],
      password: [null, [Validators.required, this.passwordPatternValidator()]],
      confirmPassword: [null, Validators.required],
    });

  }

  showAlert(alertType: 'handleResponse' | 'handleError' | 'handleErrorResponse') {
    const messages: { [key: string]: string } = {
      handleResponse: 'Mot de passe modifié avec succès.',
      handleErrorResponse: 'Vérifiez votre ancien mot de passe.',
      handleError: 'Une erreur s\'est produite.'
    };
    this[alertType] = true;
    this.alertMessage = messages[alertType];
  
    setTimeout(() => {
      this[alertType] = false;
      this.alertMessage = '';
    }, 3000);
  }

  passwordPatternValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
      return pattern.test(control.value) ? null : { passwordInvalid: true };
    };
  }

  markAllAsTouched() {
    Object.keys(this.resetForm.controls).forEach(key => {
      this.resetForm.get(key)?.markAsTouched();
    });
  }

  toggleOldPassword() {
    this.hideOldPassword = !this.hideOldPassword;
  }

  togglePassword() {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfirmPassword() {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }


  onSubmit() {
    this.markAllAsTouched();
    // stop here if form is invalid
    if (this.resetForm.invalid) {
      return;
    }

    const { oldPassword, password, confirmPassword } = this.resetForm.controls;
    if (password.value !== confirmPassword.value) {
      this.passwordNotMatched = true;
      return;
    }

    const data = {
      password: oldPassword.value,
      newPassword: password.value
    }

    this.isLoading = true
    // console.log(data)
    this.userService.updatePassword(data).subscribe({
      next: (res) => {
        if (res.status) {
          this.passwordNotMatched = false
          // console.log(res)
          this.resetForm.reset()
          this.showAlert('handleResponse');
        } else {
          this.showAlert('handleErrorResponse');
          console.error(res)
        }
        this.isLoading = false
      }, error: error => {
        this.showAlert('handleError');
        this.isLoading = false
      }
    })
  }


  
  
}
