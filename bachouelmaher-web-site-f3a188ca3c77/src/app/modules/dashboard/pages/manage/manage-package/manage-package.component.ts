import {Component, OnDestroy, OnInit} from '@angular/core';
import {Package} from "../../../../../core/models/package.model";
import {NgxMaterialIntlTelInputComponent} from "ngx-material-intl-tel-input";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {PackagesService} from "../../../../../core/services/packages.service";
import {ToastrService} from "ngx-toastr";
import {ActivatedRoute, Router} from "@angular/router";
import {lastValueFrom} from "rxjs";
import {toast} from "ngx-sonner";
import {NgClass, NgIf} from "@angular/common";
import {Editor, NgxEditorModule, Toolbar, toHTML, toDoc} from 'ngx-editor';

@Component({
  selector: 'app-manage-package',
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    NgxEditorModule,
    NgClass
  ],
  templateUrl: './manage-package.component.html',
  styleUrl: './manage-package.component.scss'
})
export class ManagePackageComponent implements OnInit, OnDestroy {
  type!: string | null
  packageId!: string | null
  package!: Package

  managePackageForm!: FormGroup;
  isLoading = false

  editor: Editor;
  toolbar: Toolbar = [
    ['bold', 'italic'],
    ['underline', 'strike'],
    ['code', 'blockquote'],
    ['ordered_list', 'bullet_list'],
    [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    ['link', 'image'],
    ['text_color', 'background_color'],
    ['align_left', 'align_center', 'align_right', 'align_justify'],
  ];

  constructor(private fb : FormBuilder, private packagesService: PackagesService, private toastr: ToastrService, private router: Router, private route: ActivatedRoute) {
    this.editor = new Editor();
  }

  async ngOnInit() {

    this.type = this.route.snapshot.queryParamMap.get('type');
    this.packageId = this.route.snapshot.queryParamMap.get('packageId');

    this.managePackageForm = this.fb.group({
      name: [null, Validators.required],
      description: [null, [Validators.required]],
      duration: [null, Validators.required],
      price: [null, Validators.required],
      type: [null, Validators.required],
      position: [null, Validators.required],
    });

    if (this.type == 'edit') {
      this.isLoading = true
      const result$ = this.packagesService.getPackageDetails(this.packageId!)
      const result = await lastValueFrom(result$);
      this.package = result.data
      this.managePackageForm.patchValue({
        name: this.package.name,
        description: toDoc(this.package.description),
        duration: this.package.duration,
        price: this.package.price,
        type: this.package.type,
        position: this.package.position,
      });
      this.isLoading = false
    }

  }

  markAllAsTouched() {
    Object.keys(this.managePackageForm.controls).forEach((key) => {
      this.managePackageForm.get(key)?.markAsTouched();
    });
  }

  managePackage(){
    this.markAllAsTouched();
    if (this.managePackageForm.valid) {
      this.isLoading = true
      const data = {
        name: this.managePackageForm.value.name,
        description: toHTML(this.managePackageForm.value.description),
        duration: this.managePackageForm.value.duration,
        price: this.managePackageForm.value.price,
        type: this.managePackageForm.value.type,
        position: this.managePackageForm.value.position,
      }
      if(this.type == 'add') {
        this.packagesService.addPackage(data).subscribe({
          next: (result) => {
            if (result.status) {
              this.isLoading = false
              this.toastr.success('Abonnement ajouté avec succès', 'Enregistré', { timeOut: 1500 });
              this.router.navigate([`/admin985xilinp/dashboard/subscriptions/packages`]);
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
        this.packagesService.updatePackage(this.package.id, data).subscribe({
          next: (result) => {
            if (result.status) {
              this.isLoading = false
              this.toastr.success('Abonnement modifié avec succès', 'Enregistré', { timeOut: 1500 });
              this.router.navigate([`/admin985xilinp/dashboard/subscriptions/packages`]);
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
    this.router.navigate([`/admin985xilinp/dashboard/subscriptions/packages`]);
  }
  // make sure to destory the editor
  ngOnDestroy(): void {
    this.editor.destroy();
  }
}
