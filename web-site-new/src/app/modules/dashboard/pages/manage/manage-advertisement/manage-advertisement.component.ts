import {Component, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {Advertisement} from "../../../../../core/models/advertisement.model";
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {AdvertisementsService} from "../../../../../core/services/advertisements.service";
import {ToastrService} from "ngx-toastr";
import {ActivatedRoute, Router} from "@angular/router";
import {lastValueFrom} from "rxjs";
import {toast} from "ngx-sonner";
import {Image} from "../../../../../core/models/image.model";
import {MediaDialogComponent} from "../../../components/dialog/media-dialog/media-dialog.component";
import {NgClass, NgIf} from "@angular/common";

@Component({
  selector: 'app-manage-advertisement',
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    NgClass
  ],
  templateUrl: './manage-advertisement.component.html',
  styleUrl: './manage-advertisement.component.scss'
})
export class ManageAdvertisementComponent implements OnInit {
  @ViewChild('actions', { static: true, read: ViewContainerRef })
  actions!: ViewContainerRef;
  type!: string | null
  advertisementId!: string | null
  advertisement!: Advertisement
  selectedType = 'image'
  selectedImage!: Image | undefined
  manageAdvertisementForm!: FormGroup;
  isLoading = false
  submitted = false

  constructor(private fb : FormBuilder, private advertisementsService: AdvertisementsService, private toastr: ToastrService, private router: Router, private route: ActivatedRoute) {

  }
  async ngOnInit() {
    this.selectedImage = undefined
    this.type = this.route.snapshot.queryParamMap.get('type');
    this.advertisementId = this.route.snapshot.queryParamMap.get('advertisementId');
    this.manageAdvertisementForm = this.fb.group({
      title: [null, null],
      position: [null, [Validators.required]],
      details: [null, null],
      type: ['image', [Validators.required]],
      permalink: [null, null],
      status: [1, Validators.required],
    });

    if (this.type == 'edit') {
      this.isLoading = true
      const result$ = this.advertisementsService.getAdvertisementDetails(this.advertisementId!)
      const result = await lastValueFrom(result$);

      this.advertisement = result.data
      this.manageAdvertisementForm.patchValue({
        title: this.advertisement.title,
        details: this.advertisement.details,
        position: this.advertisement.position,
        type: this.advertisement.type,
        permalink: this.advertisement.permalink,
        status: this.advertisement.status,
      });
      this.selectedType = this.advertisement.type
      this.selectedImage = this.advertisement.image
      if(this.selectedType == 'image') {
        this.manageAdvertisementForm.removeControl('video')
      } else {
        this.manageAdvertisementForm.addControl('video', new FormControl(this.advertisement.video, Validators.required));
      }
      this.isLoading = false
    }

  }
  markAllAsTouched() {
    Object.keys(this.manageAdvertisementForm.controls).forEach((key) => {
      this.manageAdvertisementForm.get(key)?.markAsTouched();
    });
  }
  bachToList() {
    this.router.navigate([`/admin985xilinp/dashboard/advertisements`]);
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
  manageAdvertisement(){
    this.submitted = true;
    this.markAllAsTouched();
    if (this.manageAdvertisementForm.valid) {
      if((this.selectedType == 'image' && this.selectedImage) || this.selectedType == 'video') {
        this.isLoading = true
        const data = {
          title: this.manageAdvertisementForm.value.title,
          details: this.manageAdvertisementForm.value.details,
          position: this.manageAdvertisementForm.value.position,
          type: this.manageAdvertisementForm.value.type,
          permalink: this.manageAdvertisementForm.value.permalink,
          image: this.selectedImage ? this.selectedImage.id : null,
          video: this.manageAdvertisementForm.value.video,
          status: this.manageAdvertisementForm.value.status,
        }
        if(this.type == 'add') {
          this.advertisementsService.addAdvertisement(data).subscribe({
            next: (result) => {
              if (result.status) {
                this.isLoading = false
                this.toastr.success('Publicité ajouté avec succès', 'Enregistré', { timeOut: 1500 });
                this.router.navigate([`/admin985xilinp/dashboard/advertisements`]);
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
          this.advertisementsService.updateAdvertisement(this.advertisement.id, data).subscribe({
            next: (result) => {
              if (result.status) {
                this.isLoading = false
                this.toastr.success('Publicité modifié avec succès', 'Enregistré', { timeOut: 1500 });
                this.router.navigate([`/admin985xilinp/dashboard/advertisements`]);
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

  onChangeType($event: any) {
    this.selectedType = $event.target.value;
    if(this.selectedType == 'image') {
      this.manageAdvertisementForm.removeControl('video')
    } else {
      this.manageAdvertisementForm.addControl('video', new FormControl('', Validators.required));
    }
  }
}
