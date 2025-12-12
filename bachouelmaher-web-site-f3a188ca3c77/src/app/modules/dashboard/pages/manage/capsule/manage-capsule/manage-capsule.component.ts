import {Component, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {Capsule} from "../../../../../../core/models/capsule.model";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {CapsulesService} from "../../../../../../core/services/capsules.service";
import {ToastrService} from "ngx-toastr";
import {ActivatedRoute, Router} from "@angular/router";
import {lastValueFrom} from "rxjs";
import {toast} from "ngx-sonner";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {MatAutocomplete, MatAutocompleteTrigger, MatOption} from "@angular/material/autocomplete";
import {MatCheckbox} from "@angular/material/checkbox";
import {MatIconButton} from "@angular/material/button";
import {MatInput} from "@angular/material/input";
import {MatTree, MatTreeNode, MatTreeNodeDef, MatTreeNodePadding, MatTreeNodeToggle} from "@angular/material/tree";
import {SvgIconComponent} from "angular-svg-icon";
import {SelectionModel} from "@angular/cdk/collections";
import {CategoryCapsule} from "../../../../../../core/models/category-capsule.model";
import {CategoriesCapsulesService} from "../../../../../../core/services/categories-capsules.service";
import {MatSelect} from "@angular/material/select";
import {Provider} from "../../../../../../core/models/provider.model";
import {ProvidersService} from "../../../../../../core/services/providers.service";

@Component({
  selector: 'app-manage-capsule',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    ReactiveFormsModule,
    NgClass,
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatCheckbox,
    MatIconButton,
    MatInput,
    MatOption,
    MatTree,
    MatTreeNode,
    MatTreeNodeDef,
    MatTreeNodePadding,
    MatTreeNodeToggle,
    SvgIconComponent,
    MatSelect,
    NgForOf
  ],
  templateUrl: './manage-capsule.component.html',
  styleUrl: './manage-capsule.component.scss'
})
export class ManageCapsuleComponent implements OnInit {
  @ViewChild('actions', { static: true, read: ViewContainerRef })
  actions!: ViewContainerRef;
  type!: string | null
  capsuleId!: string | null
  capsule!: Capsule
  categories: CategoryCapsule[] = [];
  providers!: Provider[]

  manageCapsuleForm!: FormGroup;
  isLoading = false
  submitted = false

  childrenAccessor = (node: CategoryCapsule) => node.children ?? [];
  hasChild = (_: number, node: CategoryCapsule) => !!node.children && node.children.length > 0;
  /** The selection for checklist */
  checklistSelection = new SelectionModel<string>();
  checklistCategory = new SelectionModel<CategoryCapsule>();

  constructor(private providersService: ProvidersService,private categoriesService: CategoriesCapsulesService, private fb : FormBuilder, private capsulesService: CapsulesService, private toastr: ToastrService, private router: Router, private route: ActivatedRoute) {

  }
  async ngOnInit() {
    await this.getCategories()
    await this.getProviders()
    this.type = this.route.snapshot.queryParamMap.get('type');
    this.capsuleId = this.route.snapshot.queryParamMap.get('capsuleId');
    const urlPattern = new RegExp(/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/igm);
    this.manageCapsuleForm = this.fb.group({
      title: [null, Validators.required],
      details: [null, [Validators.required]],
      url: [null, [Validators.required, Validators.pattern(urlPattern)]],
      category: [null, [Validators.required]],
      provider: [null, [Validators.required]],
      status: [1, Validators.required],
    });

    if (this.type == 'edit') {
      this.isLoading = true
      const result$ = this.capsulesService.getCapsuleDetails(this.capsuleId!)
      const result = await lastValueFrom(result$);

      this.capsule = result.data
      this.manageCapsuleForm.patchValue({
        title: this.capsule.title,
        details: this.capsule.details,
        url: this.capsule.url,
        category: this.capsule.category.id,
        provider: this.capsule.provider.id,
        status: this.capsule.status,
      });
      this.checklistSelection.setSelection(this.capsule.category.id)
      this.checklistCategory.setSelection(this.capsule.category)
      this.isLoading = false
    }

  }
  markAllAsTouched() {
    Object.keys(this.manageCapsuleForm.controls).forEach((key) => {
      this.manageCapsuleForm.get(key)?.markAsTouched();
    });
  }

  manageCapsule(){
    this.submitted = true;
    this.markAllAsTouched();
    if (this.manageCapsuleForm.valid) {
      this.isLoading = true
      const data = {
        title: this.manageCapsuleForm.value.title,
        details: this.manageCapsuleForm.value.details,
        url: this.manageCapsuleForm.value.url,
        category: this.manageCapsuleForm.value.category,
        provider: this.manageCapsuleForm.value.provider,
        status: this.manageCapsuleForm.value.status,
      }
      if(this.type == 'add') {
        this.capsulesService.addCapsule(data).subscribe({
          next: (result) => {
            if (result.status) {
              this.isLoading = false
              this.toastr.success('Capsule ajouté avec succès', 'Enregistré', { timeOut: 1500 });
              this.router.navigate([`/admin985xilinp/dashboard/capsules/list`]);
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
        this.capsulesService.updateCapsule(this.capsule.id, data).subscribe({
          next: (result) => {
            if (result.status) {
              this.isLoading = false
              this.toastr.success('Capsule modifié avec succès', 'Enregistré', { timeOut: 1500 });
              this.router.navigate([`/admin985xilinp/dashboard/capsules/list`]);
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
    this.router.navigate([`/admin985xilinp/dashboard/capsules/list`]);
  }
  getSelectedItem(): string {
    return this.checklistCategory.selected.map(s => s.name).join(",");
  }
  onSelectCategory($event: any, category: CategoryCapsule) {
    if($event.checked) {
      this.checklistSelection.select(category.id)
      this.checklistCategory.select(category)
      this.manageCapsuleForm.patchValue({
        category: category.id
      })
    } else {
      this.checklistSelection.deselect(category.id)
      this.checklistCategory.deselect(category)
      this.manageCapsuleForm.patchValue({
        category: null
      })
    }
  }
  async getCategories() {
    this.categoriesService.getAllCategoriesTree().subscribe({
      next: (result) => {
        this.categories = result.data.categories
      },
      error: (error) => this.handleRequestError(error),
    });
  }
  async getProviders() {
    this.isLoading = true
    this.providersService.getAllActiveProviders(1).subscribe({
      next: (result) => {
        this.providers = result.data.providers
        this.isLoading = false
      },
      error: (error) => this.handleRequestError(error),
    });
  }
}
