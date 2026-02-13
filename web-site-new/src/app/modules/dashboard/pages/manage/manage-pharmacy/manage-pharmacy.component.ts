import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Pharmacy} from "../../../../../core/models/pharmacy.model";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {PharmaciesService} from "../../../../../core/services/pharmacies.service";
import {ToastrService} from "ngx-toastr";
import {toast} from "ngx-sonner";
import {NgClass, NgIf} from "@angular/common";
import {ActivatedRoute, Router} from "@angular/router";
import {lastValueFrom} from "rxjs";
import {NgxMaterialIntlTelInputComponent, TextLabels} from "ngx-material-intl-tel-input";

@Component({
  selector: 'app-manage-pharmacy',
  standalone: true,
    imports: [
        NgIf,
        FormsModule,
        ReactiveFormsModule,
        NgClass,
        NgxMaterialIntlTelInputComponent
    ],
  templateUrl: './manage-pharmacy.component.html',
  styleUrl: './manage-pharmacy.component.scss'
})
export class ManagePharmacyComponent implements OnInit {
  type!: string | null
  pharmacyId!: string | null
  pharmacy!: Pharmacy

  textLabels: TextLabels = {
    codePlaceholder: "",
    hintLabel: "",
    invalidNumberError: "",
    nationalNumberLabel: "",
    noEntriesFoundLabel: "",
    requiredError: "",
    searchPlaceholderLabel: "",
    mainLabel: ''}

  managePharmacyForm!: FormGroup;
  isLoading = false

  constructor(private fb : FormBuilder, private pharmaciesService: PharmaciesService, private toastr: ToastrService, private router: Router, private route: ActivatedRoute) {

  }

  async ngOnInit() {

    this.type = this.route.snapshot.queryParamMap.get('type');
    this.pharmacyId = this.route.snapshot.queryParamMap.get('pharmacyId');

    this.managePharmacyForm = this.fb.group({
      name: [null, Validators.required],
      email: [null, [Validators.email, Validators.required]],
      tel: [null, Validators.required],
      address: [null, Validators.required],
      city: [null, Validators.required],
      zipCode: [null, Validators.required],
    });

    if (this.type == 'edit') {
      this.isLoading = true
      const result$ = this.pharmaciesService.getPharmacyDetails(this.pharmacyId!)
      const result = await lastValueFrom(result$);

      this.pharmacy = result.data
      this.managePharmacyForm.patchValue({
        name: this.pharmacy.name,
        email: this.pharmacy.email,
        tel: this.pharmacy.tel,
        address: this.pharmacy.address,
        city: this.pharmacy.city,
        zipCode: this.pharmacy.zipCode,
      });
      this.isLoading = false
    }

  }

  markAllAsTouched() {
    Object.keys(this.managePharmacyForm.controls).forEach((key) => {
      this.managePharmacyForm.get(key)?.markAsTouched();
    });
  }

  managePharmacy(){
    this.markAllAsTouched();
    if (this.managePharmacyForm.valid) {
      this.isLoading = true
      const data = {
        name: this.managePharmacyForm.value.name,
        email: this.managePharmacyForm.value.email,
        tel: this.managePharmacyForm.value.tel,
        address: this.managePharmacyForm.value.address,
        city: this.managePharmacyForm.value.city,
        zipCode: this.managePharmacyForm.value.zipCode,
      }
      if(this.type == 'add') {
        this.pharmaciesService.addPharmacy(data).subscribe({
          next: (result) => {
            if (result.status) {
              this.isLoading = false
              this.toastr.success('Pharmacie ajouté avec succès', 'Enregistré', { timeOut: 1500 });
              this.router.navigate([`/admin985xilinp/dashboard/pharmacies`]);
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
        this.pharmaciesService.updatePharmacy(this.pharmacy.id, data).subscribe({
          next: (result) => {
            if (result.status) {
              this.isLoading = false
              this.toastr.success('Pharmacie modifié avec succès', 'Enregistré', { timeOut: 1500 });
              this.router.navigate([`/admin985xilinp/dashboard/pharmacies`]);
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
    this.router.navigate([`/admin985xilinp/dashboard/pharmacies`]);
  }
}
