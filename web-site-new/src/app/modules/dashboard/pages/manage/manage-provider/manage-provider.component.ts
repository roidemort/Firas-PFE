import {Component, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {Provider} from "../../../../../core/models/provider.model";
import {Image} from "../../../../../core/models/image.model";
import {FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {ProvidersService} from "../../../../../core/services/providers.service";
import {ToastrService} from "ngx-toastr";
import {ActivatedRoute, Router} from "@angular/router";
import {lastValueFrom} from "rxjs";
import {MediaDialogComponent} from "../../../components/dialog/media-dialog/media-dialog.component";
import {toast} from "ngx-sonner";
import {NgClass, NgForOf, NgIf} from "@angular/common";

@Component({
  selector: 'app-manage-provider',
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    NgClass,
    NgForOf
  ],
  templateUrl: './manage-provider.component.html',
  styleUrl: './manage-provider.component.scss'
})
export class ManageProviderComponent implements OnInit {
  @ViewChild('actions', { static: true, read: ViewContainerRef })
  actions!: ViewContainerRef;
  type!: string | null
  providerId!: string | null
  provider!: Provider
  selectedImage!: Image | undefined

  manageProviderForm!: FormGroup;
  isLoading = false
  submitted = false

  constructor(private fb : FormBuilder, private providersService: ProvidersService, private toastr: ToastrService, private router: Router, private route: ActivatedRoute) {

  }
  async ngOnInit() {
    this.selectedImage = undefined
    this.type = this.route.snapshot.queryParamMap.get('type');
    this.providerId = this.route.snapshot.queryParamMap.get('providerId');

    this.manageProviderForm = this.fb.group({
      name: [null, Validators.required],
      position: [null, [Validators.required]],
      status: [1, Validators.required],
      is_searchable: [1, Validators.required],
    });

    if (this.type == 'edit') {
      this.isLoading = true
      const result$ = this.providersService.getProviderDetails(this.providerId!)
      const result = await lastValueFrom(result$);//Todo check error case

      this.provider = result.data
      this.manageProviderForm.patchValue({
        name: this.provider.name,
        position: this.provider.position,
        status: this.provider.status,
        is_searchable: this.provider.is_searchable,
      });
      this.selectedImage = this.provider.logo
      this.isLoading = false
    }

  }
  markAllAsTouched() {
    Object.keys(this.manageProviderForm.controls).forEach((key) => {
      this.manageProviderForm.get(key)?.markAsTouched();
    });
  }

  browserMedia() {
    const mediaDialogComponent = this.actions.createComponent(MediaDialogComponent);
    mediaDialogComponent.instance.closeActions.subscribe((res :any) => {
      if(res != 'cancel') {
        this.selectedImage = res[0]
      }
      mediaDialogComponent.destroy()
    });
  }

  manageProvider(){
    this.submitted = true;
    this.markAllAsTouched();
    if (this.manageProviderForm.valid) {
      this.isLoading = true

      const data = {
        name: this.manageProviderForm.value.name,
        position: this.manageProviderForm.value.position,
        status: this.manageProviderForm.value.status,
        is_searchable: this.manageProviderForm.value.is_searchable,
        logo: this.selectedImage ? this.selectedImage.id : null,

      }
      if(this.type == 'add') {
        this.providersService.addProvider(data).subscribe({
          next: (result) => {
            if (result.status) {
              this.isLoading = false
              this.toastr.success('Fournisseur ajouté avec succès', 'Enregistré', { timeOut: 1500 });
              this.router.navigate([`/admin985xilinp/dashboard/providers`]);
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
        this.providersService.updateProvider(this.provider.id, data).subscribe({
          next: (result) => {
            if (result.status) {
              this.isLoading = false
              this.toastr.success('Fournisseur modifié avec succès', 'Enregistré', { timeOut: 1500 });
              this.router.navigate([`/admin985xilinp/dashboard/providers`]);
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
    this.router.navigate([`/admin985xilinp/dashboard/providers`]);
  }
}
