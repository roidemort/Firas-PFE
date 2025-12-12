import {Component, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {Section} from "../../../../../core/models/section.model";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {ToastrService} from "ngx-toastr";
import {ActivatedRoute, Router} from "@angular/router";
import {lastValueFrom} from "rxjs";
import {toast} from "ngx-sonner";
import {SectionsService} from "../../../../../core/services/sections.service";
import {NgClass, NgIf} from "@angular/common";

@Component({
  selector: 'app-manage-section',
  standalone: true,
  imports: [
    NgIf,
    NgClass,
    ReactiveFormsModule
  ],
  templateUrl: './manage-section.component.html',
  styleUrl: './manage-section.component.scss'
})
export class ManageSectionComponent implements OnInit {
  @ViewChild('actions', { static: true, read: ViewContainerRef })
  actions!: ViewContainerRef;
  type!: string | null
  sectionId!: string | null
  section!: Section

  manageSectionForm!: FormGroup;
  isLoading = false
  submitted = false

  constructor(private fb : FormBuilder, private sectionsService: SectionsService, private toastr: ToastrService, private router: Router, private route: ActivatedRoute) {

  }
  async ngOnInit() {
    this.type = this.route.snapshot.queryParamMap.get('type');
    this.sectionId = this.route.snapshot.queryParamMap.get('sectionId');

    this.manageSectionForm = this.fb.group({
      title: [null, Validators.required],
      details: [null, [Validators.required]],
    });

    if (this.type == 'edit') {
      this.isLoading = true
      const result$ = this.sectionsService.getSectionDetails(this.sectionId!)
      const result = await lastValueFrom(result$);//Todo check error case

      this.section = result.data
      this.manageSectionForm.patchValue({
        title: this.section.title,
        details: this.section.details,
      });

      this.isLoading = false
    }

  }
  markAllAsTouched() {
    Object.keys(this.manageSectionForm.controls).forEach((key) => {
      this.manageSectionForm.get(key)?.markAsTouched();
    });
  }

  manageSection(){
    this.submitted = true;
    this.markAllAsTouched();
    if (this.manageSectionForm.valid) {
      this.isLoading = true

      const data = {
        title: this.manageSectionForm.value.title,
        details: this.manageSectionForm.value.details
      }
      if(this.type == 'edit') {
        this.sectionsService.updateSection(this.section.id!, data).subscribe({
          next: (result) => {
            if (result.status) {
              this.isLoading = false
              this.toastr.success('Section modifié avec succès', 'Enregistré', { timeOut: 1500 });
              this.router.navigate([`/admin985xilinp/dashboard/courses/list`]);
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
    this.router.navigate([`/admin985xilinp/dashboard/courses/list`]);
  }
}
