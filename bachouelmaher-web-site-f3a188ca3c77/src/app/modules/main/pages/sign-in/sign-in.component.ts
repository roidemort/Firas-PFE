
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MainLoaderComponent } from "../../components/loader/loader.component";
import { AuthService } from 'src/app/core/services/auth.service';
import { LocalStorageService } from 'src/app/core/services/localstorage.service';


@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MainLoaderComponent, RouterModule],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss'
})
export class SignInComponent {
  loginForm: FormGroup;
  isLoading = true;
  handleError = false;
  handleErrorResponse = false;
  handleResponse = false;
  serverMessage = '';
  user: any
  constructor(
    private router: Router,
    private authService: AuthService,
    private localStorageService: LocalStorageService,
    private fb: FormBuilder) {

    this.loginForm = this.fb.group({
      email: [null, [Validators.required, Validators.email]],
      password: [null, Validators.required],
      remember: [true, Validators.required],
    });
  }

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/notre-plateforme/cours'])
    }
    this.isLoading = false
  }

  markAllAsTouched() {
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.markAsTouched();
    });
  }


  resetAlerts() {
    this.handleError = false;
    this.handleResponse = false;
    this.handleErrorResponse = false;
  }

  getAlertMessage(): string {
    if (this.handleErrorResponse) return 'Vous n\'êtes pas autorisé à vous connecter.';
    if (this.handleResponse && this.serverMessage) return this.serverMessage;
    if (this.handleResponse) return 'Email ou mot de passe incorrect';
    return 'Une erreur s\'est produite';
  }

  closeAlert() {
    this.resetAlerts();
  }

  onSubmit() {
    this.resetAlerts();
    this.markAllAsTouched();

    if (this.loginForm.invalid) return;

    this.isLoading = true;
    const { email, password, remember } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: (res) => {
        if (res.status) {
          if (res.data?.user?.role === 'SUPER_ADMIN') {
            this.handleErrorResponse = true;
          } else {
            const user = { token: res.data.token, ...res.data.user };
            if (!remember) this.localStorageService.setOurStorage(sessionStorage);
            this.localStorageService.setItem('user', user);
            this.router.navigate(['/notre-plateforme/cours'])
          }
        } else {
          this.handleResponse = true;
          this.serverMessage = res.message || '';
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.handleError = true;
        this.isLoading = false;
      }
    });
  }

}
