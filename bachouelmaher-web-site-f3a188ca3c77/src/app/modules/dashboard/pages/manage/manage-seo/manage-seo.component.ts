import {Component, OnInit} from '@angular/core';
import {Seo} from "../../../../../core/models/seo.model";
import {FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {ToastrService} from "ngx-toastr";
import {ActivatedRoute, Router} from "@angular/router";
import {lastValueFrom} from "rxjs";
import {toast} from "ngx-sonner";
import {SeoService} from "../../../../../core/services/seo.service";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {NgxMaterialIntlTelInputComponent} from "ngx-material-intl-tel-input";

@Component({
  selector: 'app-manage-seo',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    NgxMaterialIntlTelInputComponent,
    ReactiveFormsModule,
    NgClass,
    NgForOf
  ],
  templateUrl: './manage-seo.component.html',
  styleUrl: './manage-seo.component.scss'
})
export class ManageSeoComponent implements OnInit {
  type!: string | null
  seoId!: string | null
  seo!: Seo

  manageSeoForm!: FormGroup;
  isLoading = false

  constructor(private fb : FormBuilder, private seoService: SeoService, private toastr: ToastrService, private router: Router, private route: ActivatedRoute) {

  }

  async ngOnInit() {

    this.type = this.route.snapshot.queryParamMap.get('type');
    this.seoId = this.route.snapshot.queryParamMap.get('seoId');

    this.manageSeoForm = this.fb.group({
      title: [null, Validators.required],
      robots: [null, [Validators.required]],
      permalink: [null, Validators.required],
      metaTags: this.fb.array([]),
    });

    if (this.type == 'edit') {
      this.isLoading = true
      const result$ = this.seoService.getSeoDetails(this.seoId!)
      const result = await lastValueFrom(result$);

      this.seo = result.data
      const formatMeta = this.seo.metaTags.map(meta => {
        this.addMetaTag()
        const keys = Object.keys(meta).filter((key) => {
          return key !== 'content' && key !== 'id'
        })
        let text = meta.name || meta.property
        return {
          type: keys[0],
          name: text,
          content: meta.content
        }
      })
      this.manageSeoForm.patchValue({
        title: this.seo.title,
        robots: this.seo.robots,
        permalink: this.seo.permalink,
        metaTags: formatMeta,
      });
      this.isLoading = false
    }

  }
  addMetaTag(): void {
    this.metaTags.push(this.value());
  }
  removeMetaTag(i: number): void {
    this.metaTags.removeAt(i);
  }
  get metaTags(): any {
    return this.manageSeoForm.get('metaTags') as FormArray;
  }
  clearFormArray = (formArray: FormArray) => {
    while (formArray.length !== 0) {
      formArray.removeAt(0)
    }
  }
  value(): any {
    return this.fb.group({
      type: this.fb.control('', [Validators.required]),
      name: this.fb.control('', [Validators.required]),
      content: this.fb.control('', [Validators.required]),
    });
  }
  markAllAsTouched() {
    Object.keys(this.manageSeoForm.controls).forEach((key) => {
      this.manageSeoForm.get(key)?.markAsTouched();
    });
  }

  managePharmacy(){
    const valuesSeo = this.manageSeoForm.value.metaTags!.map(function(meta: any) {
      return  {
        [meta.type] : meta.name,
        'content': meta.content
      }
    });
    this.markAllAsTouched();
    if (this.manageSeoForm.valid) {
      this.isLoading = true
      const data = {
        title: this.manageSeoForm.value.title,
        robots: this.manageSeoForm.value.robots,
        permalink: this.manageSeoForm.value.permalink,
        metaTags: valuesSeo,
      }
      if(this.type == 'add') {
        this.seoService.addSeo(data).subscribe({
          next: (result) => {
            if (result.status) {
              this.isLoading = false
              this.toastr.success('Référencement ajouté avec succès', 'Enregistré', { timeOut: 1500 });
              this.router.navigate([`/admin985xilinp/dashboard/seo`]);
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
        this.seoService.updateSeo(this.seo.id, data).subscribe({
          next: (result) => {
            if (result.status) {
              this.isLoading = false
              this.toastr.success('Référencement modifié avec succès', 'Enregistré', { timeOut: 1500 });
              this.router.navigate([`/admin985xilinp/dashboard/seo`]);
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
    this.router.navigate([`/admin985xilinp/dashboard/seo`]);
  }
}
