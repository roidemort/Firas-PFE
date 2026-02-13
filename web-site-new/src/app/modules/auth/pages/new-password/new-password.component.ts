import { Component, OnInit } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule, ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import {NgClass, NgIf} from "@angular/common";
import {AuthService} from "../../../../core/services/auth.service";
import {ToastrService} from "ngx-toastr";


const confirmPasswordValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  return control.value.password === control.value.confirmPassword
    ? null
    : { PasswordNoMatch: true };
};

@Component({
  selector: 'app-new-password',
  templateUrl: './new-password.component.html',
  styleUrls: ['./new-password.component.scss'],
  standalone: true,
  imports: [FormsModule, RouterLink, AngularSvgIconModule, ButtonComponent, NgIf, ReactiveFormsModule, NgClass],
})
export class NewPasswordComponent implements OnInit {
  form!: FormGroup;
  isLoading = false;
  submitted = false;
  passwordTextType2!: boolean;
  passwordTextType1!: boolean;
  token: string = ""
  constructor(private readonly _formBuilder: FormBuilder, private route: ActivatedRoute,private _router: Router, private authService: AuthService, private toastr: ToastrService) {
    this.route.queryParams.subscribe(params => {
      if(params && params['token']) {
        this.token = params['token'];
      }
      else {
        this._router.navigate(['/admin985xilinp/auth/sign-in']);
        return;
      }
    });
  }


  ngOnInit(): void {
    this.form = this._formBuilder.group({
      password: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]],
    }, { validators: confirmPasswordValidator});
  }
  get f() {
    return this.form.controls;
  }
  onSubmit() {
    this.submitted = true;
    this.isLoading = true
    const {password} = this.form.value;

    // stop here if form is invalid
    if (this.form.invalid) {
      this.isLoading = false
      return;
    }
    this.authService.resetPassword(password, this.token).subscribe({
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
}
