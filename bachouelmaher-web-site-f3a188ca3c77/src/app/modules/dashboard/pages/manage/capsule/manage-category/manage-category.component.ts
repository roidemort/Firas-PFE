import {Component, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {Category} from "../../../../../../core/models/category.model";
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from "@angular/forms";
import {SelectionModel} from "@angular/cdk/collections";
import {ToastrService} from "ngx-toastr";
import {ActivatedRoute, Router} from "@angular/router";
import {lastValueFrom} from "rxjs";
import {toast} from "ngx-sonner";
import {CategoryCapsule} from "../../../../../../core/models/category-capsule.model";
import {CategoriesCapsulesService} from "../../../../../../core/services/categories-capsules.service";
import {MatAutocomplete, MatAutocompleteTrigger, MatOption} from "@angular/material/autocomplete";
import {MatCheckbox} from "@angular/material/checkbox";
import {MatIconButton} from "@angular/material/button";
import {MatInput} from "@angular/material/input";
import {MatTree, MatTreeNode, MatTreeNodeDef, MatTreeNodePadding, MatTreeNodeToggle} from "@angular/material/tree";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {SvgIconComponent} from "angular-svg-icon";

@Component({
  selector: 'app-manage-category',
  standalone: true,
  imports: [
    FormsModule,
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
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    SvgIconComponent,
    NgClass
  ],
  templateUrl: './manage-category.component.html',
  styleUrl: './manage-category.component.scss'
})
export class ManageCategoryCapsuleComponent implements OnInit {
  @ViewChild('actions', { static: true, read: ViewContainerRef })
  actions!: ViewContainerRef;
  type!: string | null
  categoryId!: string | null
  category!: CategoryCapsule
  categories: CategoryCapsule[] = [];
  manageCategoryForm!: FormGroup;
  isLoading = false
  submitted = false
  checklistSelection = new SelectionModel<string>();
  checklistCategory = new SelectionModel<CategoryCapsule>();
  childrenAccessor = (node: CategoryCapsule) => node.children ?? [];
  hasChild = (_: number, node: CategoryCapsule) => !!node.children && node.children.length > 0;
  constructor(private fb : FormBuilder, private categoriesService: CategoriesCapsulesService, private toastr: ToastrService, private router: Router, private route: ActivatedRoute) {

  }
  async ngOnInit() {
    this.getCategories()
    this.type = this.route.snapshot.queryParamMap.get('type');
    this.categoryId = this.route.snapshot.queryParamMap.get('categoryId');

    this.manageCategoryForm = this.fb.group({
      name: [null, Validators.required],
      position: [null, [Validators.required]],
      status: [1, Validators.required],
    });

    if (this.type == 'edit') {
      this.isLoading = true
      const result$ = this.categoriesService.getCategoryDetails(this.categoryId!)
      const result = await lastValueFrom(result$);

      this.category = result.data

      this.manageCategoryForm.patchValue({
        name: this.category.name,
        position: this.category.position,
        status: this.category.status
      });
      this.isLoading = false
    }
  }
  markAllAsTouched() {
    Object.keys(this.manageCategoryForm.controls).forEach((key) => {
      this.manageCategoryForm.get(key)?.markAsTouched();
    });
  }

  getCategories() {
    this.isLoading = true
    this.categoriesService.getAllCategoriesTree().subscribe({
      next: (result) => {
        if(this.type == 'add') {
          this.categories = result.data.categories
        }
        if(this.type == 'edit') {
          this.categories = result.data.categories.filter((c: Category) => c.id != this.categoryId)
        }
        this.isLoading = false
      },
      error: (error) => this.handleRequestError(error),
    });
  }
  manageCategory(){
    this.submitted = true;
    this.markAllAsTouched();
    if (this.manageCategoryForm.valid) {
      this.isLoading = true

      const data = {
        name: this.manageCategoryForm.value.name,
        position: this.manageCategoryForm.value.position,
        status: this.manageCategoryForm.value.status
      }
      if(this.type == 'add') {
        this.categoriesService.addCategory(data).subscribe({
          next: (result) => {
            if (result.status) {
              this.isLoading = false
              this.toastr.success('Catégorie ajouté avec succès', 'Enregistré', { timeOut: 1500 });
              this.router.navigate([`/admin985xilinp/dashboard/capsules/categories`]);
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
        this.categoriesService.updateCategory(this.category.id, data).subscribe({
          next: (result) => {
            if (result.status) {
              this.isLoading = false
              this.toastr.success('Catégorie modifié avec succès', 'Enregistré', { timeOut: 1500 });
              this.router.navigate([`/admin985xilinp/dashboard/capsules/categories`]);
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
    this.router.navigate([`/admin985xilinp/dashboard/capsules/categories`]);
  }
  getSelectedItem(): string {
    return this.checklistCategory.selected.map(s => s.name).join(",");
  }
  onSelectCategory($event: any, category: Category) {
    if($event.checked) {
      this.checklistSelection.select(category.id)
      this.checklistCategory.select(category)
      this.manageCategoryForm.patchValue({
        parent: category.id
      })
    } else {
      this.checklistSelection.deselect(category.id)
      this.checklistCategory.deselect(category)
      this.manageCategoryForm.patchValue({
        parent: null
      })
    }
  }
}
