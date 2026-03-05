import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
    FormBuilder,
    FormGroup,
    Validators,
    ReactiveFormsModule,
    AbstractControl,
    ValidationErrors,
    ValidatorFn,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-set-password',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './set-password.component.html',
    styleUrls: ['./set-password.component.css'],
})
export class SetPasswordComponent implements OnInit {
    form!: FormGroup;
    email = '';
    token = '';
    successMessage = '';
    errorMessage = '';
    loading = false;

    constructor(
        private route: ActivatedRoute,
        private fb: FormBuilder,
        private http: HttpClient,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.token = this.route.snapshot.queryParamMap.get('token') || '';
        this.email = this.route.snapshot.queryParamMap.get('email') || '';

        this.form = this.fb.group(
            {
                newPassword: ['', [Validators.required, Validators.minLength(6)]],
                confirmPassword: ['', [Validators.required]],
            },
            { validators: this.passwordMatchValidator() }
        );
    }

    passwordMatchValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const password = control.get('newPassword');
            const confirm = control.get('confirmPassword');
            if (!password || !confirm) return null;
            return password.value === confirm.value ? null : { passwordMismatch: true };
        };
    }

    get passwordMismatch(): boolean {
        return this.form.hasError('passwordMismatch') && this.form.get('confirmPassword')!.touched;
    }

    onSubmit(): void {
        if (this.form.invalid) return;

        this.loading = true;
        this.errorMessage = '';
        this.successMessage = '';

        const body = {
            email: this.email,
            token: this.token,
            newPassword: this.form.get('newPassword')!.value,
        };

        this.http.post<any>(`${environment.apiEndpoint}auth/set-password`, body).subscribe({
            next: (res) => {
                this.loading = false;
                if (res.success) {
                    this.successMessage = res.message || 'Mot de passe défini avec succès !';
                } else {
                    this.errorMessage = res.message || 'Lien invalide ou expiré.';
                }
            },
            error: (err) => {
                this.loading = false;
                this.errorMessage = err.error?.message || 'Une erreur est survenue.';
            },
        });
    }
}
