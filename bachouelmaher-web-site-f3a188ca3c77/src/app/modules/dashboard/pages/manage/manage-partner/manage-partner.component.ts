import {Component, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {Partner} from "../../../../../core/models/partner.model";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {PartnersService} from "../../../../../core/services/partners.service";
import {ToastrService} from "ngx-toastr";
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {toast} from "ngx-sonner";
import {lastValueFrom} from "rxjs";
import {NgClass, NgIf} from "@angular/common";
import {Image} from "../../../../../core/models/image.model";
import {MediaDialogComponent} from "../../../components/dialog/media-dialog/media-dialog.component";

@Component({
  selector: 'app-manage-partner',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    ReactiveFormsModule,
    NgClass,
    RouterLink
  ],
  templateUrl: './manage-partner.component.html',
  styleUrl: './manage-partner.component.scss'
})
export class ManagePartnerComponent implements OnInit {
  @ViewChild('actions', { static: true, read: ViewContainerRef })
  actions!: ViewContainerRef;
  type!: string | null
  partnerId!: string | null
  partner!: Partner
  selectedImage!: Image | undefined

  managePartnerForm!: FormGroup;
  isLoading = false
  submitted = false

  constructor(private fb : FormBuilder, private partnersService: PartnersService, private toastr: ToastrService, private router: Router, private route: ActivatedRoute) {

  }
  async ngOnInit() {
    this.selectedImage = undefined
    this.type = this.route.snapshot.queryParamMap.get('type');
    this.partnerId = this.route.snapshot.queryParamMap.get('partnerId');

    this.managePartnerForm = this.fb.group({
      name: [null, Validators.required],
      position: [null, [Validators.required]],
      status: [null, Validators.required],
    });

    if (this.type == 'edit') {
      this.isLoading = true
      const result$ = this.partnersService.getPartnerDetails(this.partnerId!)
      const result = await lastValueFrom(result$);

      this.partner = result.data
      this.managePartnerForm.patchValue({
        name: this.partner.name,
        position: this.partner.position,
        status: this.partner.status,
      });
      this.selectedImage = this.partner.logo
      this.isLoading = false
    }

  }
  markAllAsTouched() {
    Object.keys(this.managePartnerForm.controls).forEach((key) => {
      this.managePartnerForm.get(key)?.markAsTouched();
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

  managePartner(){
    this.submitted = true;
    this.markAllAsTouched();
    if (this.managePartnerForm.valid && this.selectedImage) {
      this.isLoading = true
      const data = {
        name: this.managePartnerForm.value.name,
        position: this.managePartnerForm.value.position,
        status: this.managePartnerForm.value.status,
        logo: this.selectedImage.id
      }
      if(this.type == 'add') {
        this.partnersService.addPartner(data).subscribe({
          next: (result) => {
            if (result.status) {
              this.isLoading = false
              this.toastr.success('Partenaire ajouté avec succès', 'Enregistré', { timeOut: 1500 });
              this.router.navigate([`/admin985xilinp/dashboard/partners`]);
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
        this.partnersService.updatePartner(this.partner.id, data).subscribe({
          next: (result) => {
            if (result.status) {
              this.isLoading = false
              this.toastr.success('Partenaire modifié avec succès', 'Enregistré', { timeOut: 1500 });
              this.router.navigate([`/admin985xilinp/dashboard/partners`]);
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
    this.router.navigate([`/admin985xilinp/dashboard/partners`]);
  }
}
