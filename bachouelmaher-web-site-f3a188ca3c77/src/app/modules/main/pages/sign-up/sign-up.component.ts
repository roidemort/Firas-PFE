import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { MainLoaderComponent } from "../../components/loader/loader.component";

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MainLoaderComponent, RouterModule],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss'
})
export class SignUpComponent implements OnInit {
  registrationRequestForm: FormGroup;

  view: 'choice' | 'form' = 'choice';

  isLoading = true;
  handleError = false;
  requestSuccess = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private fb: FormBuilder) {

    this.registrationRequestForm = this.fb.group({
      pharmacyName: [null, Validators.required],
      pharmacyEmail: [null, [Validators.required, Validators.email]],
      pharmacyAddress: [null, Validators.required],
      pharmacyPhone: [null, Validators.required],
      nbPharmacien: [null, Validators.required],
      nbPreparatoire: [null, Validators.required],
      ownerLastName: [null, Validators.required],
      ownerFirstName: [null, Validators.required],
    });
  }

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.router.navigateByUrl('/profil');
    }
    this.isLoading = false;
  }

  markAllAsTouchedRequest() {
    Object.keys(this.registrationRequestForm.controls).forEach(key => {
      this.registrationRequestForm.get(key)?.markAsTouched();
    });
  }

  goToChoice() {
    this.view = 'choice';
    this.requestSuccess = false;
  }

  goToRequest() {
    this.view = 'form';
  }

  onSubmitRequest() {
    this.markAllAsTouchedRequest();
    if (this.registrationRequestForm.invalid) {
      return;
    }

    this.isLoading = true;
    const data = this.registrationRequestForm.value;
    this.authService.submitRegistrationRequest(data).subscribe({
      next: (res) => {
        if (res.status) {
          this.requestSuccess = true;
          this.registrationRequestForm.reset();
        } else {
          this.handleError = true;
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
