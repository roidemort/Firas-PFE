import {Component, OnInit, signal, ViewChild, ViewContainerRef} from '@angular/core';
import {Trainer} from "../../../../../core/models/trainer.model";
import {Image} from "../../../../../core/models/image.model";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {TrainersService} from "../../../../../core/services/trainers.service";
import {ToastrService} from "ngx-toastr";
import {ActivatedRoute, Router} from "@angular/router";
import {lastValueFrom} from "rxjs";
import {MediaDialogComponent} from "../../../components/dialog/media-dialog/media-dialog.component";
import {toast} from "ngx-sonner";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {ProvidersService} from "../../../../../core/services/providers.service";
import {Provider} from "../../../../../core/models/provider.model";
import {MatOption, MatSelect} from "@angular/material/select";

@Component({
  selector: 'app-manage-trainer',
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    NgClass,
    NgForOf,
    MatSelect,
    MatOption
  ],
  templateUrl: './manage-trainer.component.html',
  styleUrl: './manage-trainer.component.scss'
})
export class ManageTrainerComponent implements OnInit {
  @ViewChild('actions', { static: true, read: ViewContainerRef })
  actions!: ViewContainerRef;
  type!: string | null
  trainerId!: string | null
  trainer!: Trainer
  selectedImage!: Image | undefined
  providers!: Provider[]
  manageTrainerForm!: FormGroup;
  isLoading = false
  submitted = false

  constructor(private providersService: ProvidersService, private fb : FormBuilder, private trainersService: TrainersService, private toastr: ToastrService, private router: Router, private route: ActivatedRoute) {

  }
  async ngOnInit() {
    this.getProviders()
    this.selectedImage = undefined
    this.type = this.route.snapshot.queryParamMap.get('type');
    this.trainerId = this.route.snapshot.queryParamMap.get('trainerId');
    const regTwitter = new RegExp('((https://)|(www\\.))x\\.com/(\\w+)');
    this.manageTrainerForm = this.fb.group({
      name: [null, Validators.required],
      description: [null, [Validators.required]],
      email: [null, [Validators.email, Validators.required]],
      twitter: [null, []],
      job: [null, Validators.required],
      status: [1, Validators.required],
      providers: [null, Validators.required],
    });

    if (this.type == 'edit') {
      this.isLoading = true
      const result$ = this.trainersService.getTrainerDetails(this.trainerId!)
      const result = await lastValueFrom(result$);//Todo check error case

      this.trainer = result.data
      let providers = this.trainer!.providers!.map(provider => provider.id);
      this.manageTrainerForm.patchValue({
        name: this.trainer.name,
        description: this.trainer.description,
        email: this.trainer.email,
        twitter: this.trainer.twitter,
        job: this.trainer.job,
        status: this.trainer.status,
        providers: providers,
      });
      this.selectedImage = this.trainer.image
      this.isLoading = false
    }

  }
  markAllAsTouched() {
    Object.keys(this.manageTrainerForm.controls).forEach((key) => {
      this.manageTrainerForm.get(key)?.markAsTouched();
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
  getProviders() {
    this.isLoading = true
    this.providersService.getAllActiveProviders(1).subscribe({
      next: (result) => {
        this.providers = result.data.providers
        this.isLoading = false
      },
      error: (error) => this.handleRequestError(error),
    });
  }
  manageTrainer(){
    this.submitted = true;
    this.markAllAsTouched();
    if (this.manageTrainerForm.valid) {
      this.isLoading = true

      const data = {
        name: this.manageTrainerForm.value.name,
        description: this.manageTrainerForm.value.description,
        email: this.manageTrainerForm.value.email,
        twitter: this.manageTrainerForm.value.twitter,
        job: this.manageTrainerForm.value.job,
        status: this.manageTrainerForm.value.status,
        providers: this.manageTrainerForm.value.providers,
        image: this.selectedImage ? this.selectedImage.id : null,
      }
      if(this.type == 'add') {
        this.trainersService.addTrainer(data).subscribe({
          next: (result) => {
            if (result.status) {
              this.isLoading = false
              this.toastr.success('Formateur ajouté avec succès', 'Enregistré', { timeOut: 1500 });
              this.router.navigate([`/admin985xilinp/dashboard/trainers`]);
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
        this.trainersService.updateTrainer(this.trainer.id, data).subscribe({
          next: (result) => {
            if (result.status) {
              this.isLoading = false
              this.toastr.success('Formateur modifié avec succès', 'Enregistré', { timeOut: 1500 });
              this.router.navigate([`/admin985xilinp/dashboard/trainers`]);
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
    this.router.navigate([`/admin985xilinp/dashboard/trainers`]);
  }
}
