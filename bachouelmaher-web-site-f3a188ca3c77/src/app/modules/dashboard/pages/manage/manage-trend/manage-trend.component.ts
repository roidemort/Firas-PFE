import {Component, OnInit, signal, ViewChild, ViewContainerRef} from '@angular/core';
import {Image} from "../../../../../core/models/image.model";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {TrendsService} from "../../../../../core/services/trends.service";
import {ToastrService} from "ngx-toastr";
import {ActivatedRoute, Router} from "@angular/router";
import {lastValueFrom} from "rxjs";
import {MediaDialogComponent} from "../../../components/dialog/media-dialog/media-dialog.component";
import {toast} from "ngx-sonner";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {ProvidersService} from "../../../../../core/services/providers.service";
import {Provider} from "../../../../../core/models/provider.model";
import {MatOption, MatSelect} from "@angular/material/select";
import {Trend} from "../../../../../core/models/Trend.model";

@Component({
  selector: 'app-manage-trend',
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    NgClass,
    NgForOf,
    MatSelect,
    MatOption
  ],
  templateUrl: './manage-trend.component.html',
  styleUrl: './manage-trend.component.scss'
})
export class ManageTrendComponent implements OnInit {
  @ViewChild('actions', { static: true, read: ViewContainerRef })
  actions!: ViewContainerRef;
  type!: string | null
  trendId!: string | null
  trend!: Trend
  selectedImage!: Image | undefined
  providers!: Provider[]
  manageTrendForm!: FormGroup;
  isLoading = false
  submitted = false

  constructor(private providersService: ProvidersService, private fb : FormBuilder, private trendsService: TrendsService, private toastr: ToastrService, private router: Router, private route: ActivatedRoute) {

  }
  async ngOnInit() {
    this.getProviders()
    this.selectedImage = undefined
    this.type = this.route.snapshot.queryParamMap.get('type');
    this.trendId = this.route.snapshot.queryParamMap.get('trendId');
    this.manageTrendForm = this.fb.group({
      title: [null, Validators.required],
      position: [null, Validators.required],
      details: [null, ''],
    });

    if (this.type == 'edit') {
      this.isLoading = true
      const result$ = this.trendsService.getTrendDetails(this.trendId!)
      const result = await lastValueFrom(result$);
      this.trend = result.data
      this.manageTrendForm.patchValue({
        title: this.trend.title,
        position: this.trend.position,
        details: this.trend.details
      });
      this.selectedImage = this.trend.image
      this.isLoading = false
    }

  }
  markAllAsTouched() {
    Object.keys(this.manageTrendForm.controls).forEach((key) => {
      this.manageTrendForm.get(key)?.markAsTouched();
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
  manageTrend(){
    this.submitted = true;
    this.markAllAsTouched();
    if (this.manageTrendForm.valid  && this.selectedImage) {
      this.isLoading = true

      const data = {
        title: this.manageTrendForm.value.title,
        position: this.manageTrendForm.value.position,
        details: this.manageTrendForm.value.details,
        image: this.selectedImage.id,
      }
      if(this.type == 'add') {
        this.trendsService.addTrend(data).subscribe({
          next: (result) => {
            if (result.status) {
              this.isLoading = false
              this.toastr.success('Tendance ajouté avec succès', 'Enregistré', { timeOut: 1500 });
              this.router.navigate([`/admin985xilinp/dashboard/trends`]);
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
        this.trendsService.updateTrend(this.trend.id, data).subscribe({
          next: (result) => {
            if (result.status) {
              this.isLoading = false
              this.toastr.success('Tendance modifié avec succès', 'Enregistré', { timeOut: 1500 });
              this.router.navigate([`/admin985xilinp/dashboard/trends`]);
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
    const msg = 'An error occurred while fetching trends';
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
    this.router.navigate([`/admin985xilinp/dashboard/trends`]);
  }
}
