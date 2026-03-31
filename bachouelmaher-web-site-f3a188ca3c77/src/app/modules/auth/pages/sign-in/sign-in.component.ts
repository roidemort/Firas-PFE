import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgClass, NgIf } from '@angular/common';
import { AngularSvgIconModule } from 'angular-svg-icon';
import {AuthService} from "../../../../core/services/auth.service";
import {ToastrService} from "ngx-toastr";
import {LocalStorageService} from "../../../../core/services/localstorage.service";

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, AngularSvgIconModule, NgClass, NgIf],
})
export class SignInComponent implements OnInit {
  form!: FormGroup;
  isLoading = false;
  submitted = false;
  passwordTextType!: boolean;

  constructor(private readonly _formBuilder: FormBuilder, private readonly _router: Router, private authService: AuthService, private toastr: ToastrService, private localStorageService: LocalStorageService) {}

  ngOnInit(): void {
    this.form = this._formBuilder.group({
      email: ['', [Validators.required]],
      password: ['', Validators.required],
      rememberMe: [true, null],
    });
  }

  get f() {
    return this.form.controls;
  }

  togglePasswordTextType() {
    this.passwordTextType = !this.passwordTextType;
  }

  onSubmit() {
    this.submitted = true;
    this.isLoading = true
    const { email, password, rememberMe } = this.form.value;

    // stop here if form is invalid
    if (this.form.invalid) {
      this.isLoading = false
      return;
    }

    this.authService.loginAdmin(email, password).subscribe({
      next: (res) => {
        if (res.status) {
          this.isLoading = false
          const user =  {
            token: res.data.token,
            ...res.data.user
          }
          if(!rememberMe) this.localStorageService.setOurStorage(sessionStorage)
          this.localStorageService.setItem('user', user);
          this.authService.currentUserSubject.next(res.data.user);
          this._router.navigateByUrl('/admin985xilinp/dashboard');
        } else {
          this.isLoading = false
          if(res.message === 'Blocking') {
            this.toastr.warning('Votre compte est Inactif', 'Erreur', {
              timeOut: 3000
            })
          } else {
            this.toastr.warning('Vérifier vos données', 'Vérification', {
              timeOut: 3000
            })
          }

        }
      }, error: error => {
        this.isLoading = false;
        this.toastr.error('Erreur interne du serveur', 'Erreur', {
          timeOut: 1500
        })
      }
    })

  }
  goToForgetPassword() {
    this._router.navigate([`/admin985xilinp/auth/forgot-password`]);
  }
}
