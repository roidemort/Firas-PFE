import {Component, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {Category} from "../../../../../core/models/category.model";
import {Image} from "../../../../../core/models/image.model";
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from "@angular/forms";
import {CategoriesService} from "../../../../../core/services/categories.service";
import {ToastrService} from "ngx-toastr";
import {ActivatedRoute, Router} from "@angular/router";
import {lastValueFrom} from "rxjs";
import {MediaDialogComponent} from "../../../components/dialog/media-dialog/media-dialog.component";
import {toast} from "ngx-sonner";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {MatAutocomplete, MatAutocompleteTrigger, MatOption} from "@angular/material/autocomplete";
import {MatCheckbox} from "@angular/material/checkbox";
import {MatIconButton} from "@angular/material/button";
import {MatInput} from "@angular/material/input";
import {MatTree, MatTreeNode, MatTreeNodeDef, MatTreeNodePadding, MatTreeNodeToggle} from "@angular/material/tree";
import {SvgIconComponent} from "angular-svg-icon";
import {SelectionModel} from "@angular/cdk/collections";

@Component({
  selector: 'app-manage-category',
  standalone: true,
    imports: [
        FormsModule,
        NgIf,
        ReactiveFormsModule,
        NgClass,
        NgForOf,
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
        SvgIconComponent
    ],
  templateUrl: './manage-category.component.html',
  styleUrl: './manage-category.component.scss'
})
export class ManageCategoryComponent implements OnInit {
  @ViewChild('actions', { static: true, read: ViewContainerRef })
  actions!: ViewContainerRef;
  type!: string | null
  categoryId!: string | null
  category!: Category
  selectedLogo!: Image | undefined
  selectedBanner!: Image | undefined
  categories: Category[] = [];
  manageCategoryForm!: FormGroup;
  isLoading = false
  submitted = false
  showSeo = false
  checklistSelection = new SelectionModel<string>();
  checklistCategory = new SelectionModel<Category>();
  childrenAccessor = (node: Category) => node.children ?? [];
  hasChild = (_: number, node: Category) => !!node.children && node.children.length > 0;
  constructor(private fb : FormBuilder, private categoriesService: CategoriesService, private toastr: ToastrService, private router: Router, private route: ActivatedRoute) {

  }
  async ngOnInit() {
    this.getCategories()
    this.selectedLogo = undefined
    this.selectedBanner = undefined
    this.type = this.route.snapshot.queryParamMap.get('type');
    this.categoryId = this.route.snapshot.queryParamMap.get('categoryId');

    this.manageCategoryForm = this.fb.group({
      name: [null, Validators.required],
      position: [null, [Validators.required]],
      is_searchable: [1, Validators.required],
      status: [1, Validators.required],
      banner: [null, null],
      logo: [null, null],
    });

    if (this.type == 'edit') {
      this.isLoading = true
      const result$ = this.categoriesService.getCategoryDetails(this.categoryId!)
      const result = await lastValueFrom(result$);

      this.category = result.data

      this.manageCategoryForm.patchValue({
        name: this.category.name,
        position: this.category.position,
        is_searchable: this.category.is_searchable,
        status: this.category.status
      });

      if(this.category.seo) {
        this.openSeo()
        let formatMeta = null
        if(this.category.seo.metaTags && this.category.seo.metaTags.length) {
          formatMeta = this.category.seo.metaTags.map(meta => {
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
        }

        this.manageCategoryForm.patchValue({
          title: this.category.seo.title,
          robots: this.category.seo.robots,
          metaTags: formatMeta,
        })
      }
      this.selectedLogo = this.category.logo
      this.selectedBanner = this.category.banner
      this.isLoading = false
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
    Object.keys(this.manageCategoryForm.controls).forEach((key) => {
      this.manageCategoryForm.get(key)?.markAsTouched();
    });
  }
  addMetaTag(): void {
    this.metaTags.push(this.value());
  }
  removeMetaTag(i: number): void {
    this.metaTags.removeAt(i);
  }
  get metaTags(): any {
    return this.manageCategoryForm.get('metaTags') as FormArray;
  }
  clearFormArray = (formArray: FormArray) => {
    while (formArray.length !== 0) {
      formArray.removeAt(0)
    }
  }
  browserMedia(type: string) {
    const mediaDialogComponent = this.actions.createComponent(MediaDialogComponent);
    mediaDialogComponent.instance.closeActions.subscribe((res :any) => {
      if(res != 'cancel') {
        if(type === 'logo') this.selectedLogo = res[0]
        if(type === 'banner') this.selectedBanner = res[0]
      }
      mediaDialogComponent.destroy()
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
      let seo: any = {
        title: null,
        robots: null,
        metaTags: null,
      }
      if(this.showSeo) {
        const valuesSeo = this.manageCategoryForm.value.metaTags!.map(function(meta: any) {
          return  {
            [meta.type] : meta.name,
            'content': meta.content
          }
        });
        seo.title = this.manageCategoryForm.value.title
        seo.robots = this.manageCategoryForm.value.robots
        seo.metaTags = valuesSeo
      } else seo = null
      const data = {
        name: this.manageCategoryForm.value.name,
        position: this.manageCategoryForm.value.position,
        status: this.manageCategoryForm.value.status,
        is_searchable: this.manageCategoryForm.value.is_searchable,
        logo: this.selectedLogo ? this.selectedLogo.id : null,
        banner: this.selectedBanner ? this.selectedBanner.id : null,
        seo: seo
      }
      if(this.type == 'add') {
        this.categoriesService.addCategory(data).subscribe({
          next: (result) => {
            if (result.status) {
              this.isLoading = false
              this.toastr.success('Catégorie ajouté avec succès', 'Enregistré', { timeOut: 1500 });
              this.router.navigate([`/admin985xilinp/dashboard/categories`]);
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
              this.router.navigate([`/admin985xilinp/dashboard/categories`]);
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
    this.router.navigate([`/admin985xilinp/dashboard/categories`]);
  }
  openSeo() {
    this.showSeo = !this.showSeo;
    if(this.showSeo) {
      this.manageCategoryForm.addControl('title', new FormControl('', Validators.required));
      this.manageCategoryForm.addControl('robots', new FormControl('', Validators.required));
      this.manageCategoryForm.addControl('metaTags', this.fb.array([]));
    } else {
      this.manageCategoryForm.removeControl('title')
      this.manageCategoryForm.removeControl('robots')
      this.manageCategoryForm.removeControl('metaTags')
    }
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
