import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { roles } from '../../../../core/constants/roles';
import { AuthService } from 'src/app/core/services/auth.service';
import { AppPhoneNumberDirective } from 'src/app/shared/directives/app-phone-number.directive';
import { UsersService } from 'src/app/core/services/users.service';
import { LoadingService } from 'src/app/core/services/loading.service';
import { OnlyNumbersDirective } from 'src/app/shared/directives/only-numbers.directive';

@Component({
  selector: 'app-personal-information',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AppPhoneNumberDirective, OnlyNumbersDirective],
  templateUrl: './personal-information.component.html',
  styleUrls: ['./personal-information.component.scss'],
})
export class PersonalInformationComponent {
  @ViewChild('fileInput') fileInput!: ElementRef;
  editMode = { firstForm: false, secondForm: false };
  firstEditForm: FormGroup;
  secondEditForm: FormGroup;
  currentUser: any;
  isLoading = false;
  selectedFile!: File;
  roles = roles;
  imgLink = null
  handleErrorResponse = false 
  handleResponse = false 
  handleError = false 
  showContent: boolean = false;
  random: number

  constructor(private usersService: UsersService, private authService: AuthService, private fb: FormBuilder,private userService: UsersService, private loadingService: LoadingService) {
    this.firstEditForm = this.fb.group({
      email: [{ value: null, disabled: true }, Validators.required],
      fullName: [null, Validators.required],
      tel: [null, Validators.required],
    });

    this.secondEditForm = this.fb.group({
      address: [null],
      city: [null],
      zipCode: [null],
    });

    this.currentUser = this.authService.getUser();

    this.firstEditForm.patchValue({
      email: this.currentUser.email,
      fullName: `${this.currentUser.firstName} ${this.currentUser.lastName}`,
      tel: this.currentUser.tel,
    });

    this.secondEditForm.patchValue({
      address: this.currentUser.address ?? '-',
      city: this.currentUser.city ?? '-',
      zipCode: this.currentUser.zipCode ?? '-',
    });

    this.secondEditForm.disable();
    this.firstEditForm.disable();

    this.random = Math.floor(Math.random() * 11);
    setTimeout(() => {
      this.showContent = true;
    }, 10);
  }

  ngOnInit() {
    this.loadingService.setTab('details')
  }

  clearDash(controlName: string) {
    const control = this.secondEditForm.get(controlName);
    if (control?.value === '-') {
        control.setValue(''); 
    }
  }

  restoreDash(controlName: string) {
    const control = this.secondEditForm.get(controlName);
    if (!control?.value) {
        control?.setValue('-');
    }
  }

  getRoleDisplayName(role: string): string {
    return this.roles[role.toUpperCase()] || role;
  }

  toggleEditMode(form: 'firstForm' | 'secondForm') {
    const otherForm = form === 'firstForm' ? 'secondForm' : 'firstForm';
    const otherFormGroup = otherForm === 'firstForm' ? this.firstEditForm : this.secondEditForm;
    if (this.editMode[otherForm]) {
        this.editMode[otherForm] = false;
        otherFormGroup.disable();
    }

    this.editMode[form] = !this.editMode[form];
    const currentFormGroup = form === 'firstForm' ? this.firstEditForm : this.secondEditForm;

    if (this.editMode[form]) {
        currentFormGroup.enable();
        if (form === 'firstForm') {
            currentFormGroup.get('email')?.disable();
        }
    } else {
        currentFormGroup.disable();
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      const formData = new FormData();
      formData.append('upload', this.selectedFile);
      this.usersService.updateUserProfile(formData).subscribe({
        next: (res) => {
          if (res.status) {
            this.showAlert('handleResponse');
            this.imgLink = res.data.user.img_link
            // console.log(res, this.imgLink)
            this.userService.setUserUpdate(res.data.user.img_link);
            this.authService.setUser(res.data.user)

          } else {
            this.showAlert('handleErrorResponse');
          }
        }, error: error => {
          this.showAlert('handleError');
        }
      });
    }
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  getAlertMessage(): string {
    if (this.handleResponse) return 'Profil mis à jour avec succès.';
    if (this.handleErrorResponse) return 'Erreur lors de la mise à jour du profil.';
    return 'Une erreur s\'est produite';
  }
    
  closeAlert() {
    this.resetAlerts();
  }

  resetAlerts() {
    this.handleError = false;
    this.handleResponse = false;
    this.handleErrorResponse = false;
  }

  showAlert(alertType: 'handleResponse' | 'handleError' | 'handleErrorResponse') {
    this[alertType] = true;
  
    setTimeout(() => {
      this[alertType] = false;
    }, 3000);
  }

  markAllAsTouched(form: FormGroup) {
    Object.values(form.controls).forEach(control => control.markAsTouched());
  }

  onSubmit(form: 'firstForm' | 'secondForm') {
    const formGroup = form === 'firstForm' ? this.firstEditForm : this.secondEditForm;
    this.markAllAsTouched(formGroup);

    if (formGroup.invalid) return;

    this.loadingService.setLoadingState(true);

    const data = form === 'firstForm' ? this.extractFirstFormData(formGroup) : formGroup.value;

    //console.log(data);
    this.toggleEditMode(form);
    this.showAlert('handleResponse');
    this.userService.updateProfile(data).subscribe({
      next: (res) => {
        this.loadingService.setLoadingState(false);
        if (res.status) {
          //console.log(res)
          this.authService.setUser(res.data.user)
          this.authService.currentUserSubject.next(res.data.user);
          this.showAlert('handleResponse');
        } else {
          this.showAlert('handleErrorResponse');
        }
      }, error: error => {
        this.loadingService.setLoadingState(false);
        this.showAlert('handleError');
      }
    })
  }

  extractFirstFormData(formGroup: FormGroup): any {
    const { fullName, ...rest } = formGroup.value;
    const [firstName, ...lastNameParts] = fullName.trim().split(' ');
    const lastName = lastNameParts.join(' ');

    return {firstName, lastName, ...rest};
  }

}
