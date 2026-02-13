import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule, ValidationErrors,
  ValidatorFn,
  Validators
} from "@angular/forms";
import {NgClass, NgIf} from "@angular/common";
import {User} from "../../../../../core/models/user.model";
import {UsersService} from "../../../../../core/services/users.service";
import {ToastrService} from "ngx-toastr";
import {lastValueFrom} from "rxjs";
import {toast} from "ngx-sonner";
import {ActivatedRoute, Router} from "@angular/router";
import { NgxMaterialIntlTelInputComponent, TextLabels} from "ngx-material-intl-tel-input";

const confirmPasswordValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  return control.value.password === control.value.confirmPassword
    ? null
    : { PasswordNoMatch: true };
};

@Component({
  selector: 'app-manage-user',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    ReactiveFormsModule,
    NgClass,
    NgxMaterialIntlTelInputComponent
  ],
  templateUrl: './manage-user.component.html',
  styleUrl: './manage-user.component.scss'
})
export class ManageUserComponent implements OnInit {
  type!: string | null
  userId!: string | null

  user!: User

  manageUserForm!: FormGroup;
  isLoading = false

  textLabels: TextLabels = {
    codePlaceholder: "",
    hintLabel: "",
    invalidNumberError: "",
    nationalNumberLabel: "",
    noEntriesFoundLabel: "",
    requiredError: "",
    searchPlaceholderLabel: "",
    mainLabel: ''}

  constructor(private fb : FormBuilder, private usersService: UsersService, private toastr: ToastrService, private route: ActivatedRoute, private router: Router) {

  }
  async ngOnInit() {
    this.type = this.route.snapshot.queryParamMap.get('type');
    this.userId = this.route.snapshot.queryParamMap.get('userId');

    this.manageUserForm = this.fb.group({
      firstName: [null, Validators.required],
      lastName: [null, Validators.required],
      gender: [null, Validators.required],
      birthday: [null, Validators.required],
      tel: [null, Validators.required],
      email: [null, [Validators.email, Validators.required]],
      address: [null, null],
      city: [null, null],
      zipCode: [null, null],
    });
    if (this.type == 'add') {
      this.manageUserForm.addControl('key', new FormControl('', Validators.required));
      this.manageUserForm.addControl('password', new FormControl('', Validators.required));
      this.manageUserForm.addControl('confirmPassword', new FormControl('', Validators.required));
      this.manageUserForm.addValidators(confirmPasswordValidator)
    } else {
      this.isLoading = true
      const result$ = this.usersService.getUserDetails(this.userId!)
      const result = await lastValueFrom(result$);
      this.user = result.data.user
      this.manageUserForm.patchValue({
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        gender: this.user.gender,
        birthday: this.user.birthday,
        tel: this.user.tel,
        email: this.user.email,
        address: this.user.address,
        city: this.user.city,
        zipCode: this.user.zipCode,
      });
      this.isLoading = false
    }

  }

  markAllAsTouched() {
    Object.keys(this.manageUserForm.controls).forEach((key) => {
      this.manageUserForm.get(key)?.markAsTouched();
    });
  }
  manageUser(){
    this.markAllAsTouched();
    if (this.manageUserForm.valid) {
      this.isLoading = true;
      if(this.type == 'add') {
        const data = {
          key: this.manageUserForm.value.key,
          firstName: this.manageUserForm.value.firstName,
          lastName: this.manageUserForm.value.lastName,
          gender: this.manageUserForm.value.gender,
          birthday: this.manageUserForm.value.birthday,
          tel: this.manageUserForm.value.tel,
          email: this.manageUserForm.value.email,
          password: this.manageUserForm.value.password,
          address: this.manageUserForm.value.address,
          city: this.manageUserForm.value.city,
          zipCode: this.manageUserForm.value.zipCode,
        }
        this.usersService.addUser(data).subscribe({
          next: (result) => {
            if (result.status) {
              this.isLoading = false
              this.toastr.success('Utilisateur ajouté avec succès', 'Enregistré', { timeOut: 1500 });
              this.router.navigate([`/admin985xilinp/dashboard/users`]);
            } else {
              this.isLoading = false;
              this.toastr.warning('Vérifier vos données', 'Vérification', {
                timeOut: 1500
              })
            }
          },
          error: (error) => this.handleRequestError(error),
        });
      }
      if(this.type == 'edit') {
        const data = {
          firstName: this.manageUserForm.value.firstName,
          lastName: this.manageUserForm.value.lastName,
          gender: this.manageUserForm.value.gender,
          birthday: this.manageUserForm.value.birthday,
          tel: this.manageUserForm.value.tel,
          email: this.manageUserForm.value.email,
          address: this.manageUserForm.value.address,
          city: this.manageUserForm.value.city,
          zipCode: this.manageUserForm.value.zipCode,
        }
        this.usersService.updateUser(this.user.id, data).subscribe({
          next: (result) => {
            if (result.status) {
              this.isLoading = false
              this.toastr.success('Utilisateur modifié avec succès', 'Enregistré', { timeOut: 1500 });
              this.router.navigate([`/admin985xilinp/dashboard/users`]);
            } else {
              this.isLoading = false;
              this.toastr.warning('Vérifier vos données', 'Vérification', {
                timeOut: 1500
              })
            }
          },
          error: (error) => this.handleRequestError(error),
        });
      }
    }
  }
  private handleRequestError(error: any) {
    const msg = 'An error occurred while fetching users';
    toast.error(msg, {
      position: 'bottom-right',
      description: error.message,
      action: {
        label: 'Undo',
        onClick: () => console.log('Action!'),
      },
      actionButtonStyle: 'background-color:#DC2626; color:white;',
    });
  }
  bachToList() {
    this.router.navigate([`/admin985xilinp/dashboard/users`]);
  }
}
