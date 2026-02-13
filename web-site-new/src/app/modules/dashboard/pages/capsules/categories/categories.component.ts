import {Component, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {Router} from "@angular/router";
import {toast} from "ngx-sonner";
import {CategoriesCapsulesService} from "../../../../../core/services/categories-capsules.service";
import {CategoryCapsule} from "../../../../../core/models/category-capsule.model";
import {SvgIconComponent} from "angular-svg-icon";
import {MatTree, MatTreeNode, MatTreeNodeDef, MatTreeNodePadding, MatTreeNodeToggle} from "@angular/material/tree";
import {DatePipe, NgIf} from "@angular/common";
import {LoaderComponent} from "../../../../../shared/components/loader/loader.component";
import {MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    SvgIconComponent,
    LoaderComponent,
    NgIf,
    MatTree,
    MatTreeNode,
    MatTreeNodeDef,
    MatTreeNodePadding,
    MatIconButton,
    MatTreeNodeToggle,
    MatIcon,
    DatePipe
  ],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss'
})
export class CategoriesCapsuleComponent implements OnInit {

  @ViewChild('actions', { static: true, read: ViewContainerRef })
  actions!: ViewContainerRef;
  isLoading = false;
  categories: CategoryCapsule[] = [];
  selectedCategory!: CategoryCapsule;
  childrenAccessor = (node: CategoryCapsule) => node.children ?? [];
  hasChild = (_: number, node: CategoryCapsule) => !!node.children && node.children.length > 0;

  allCategoriesCount : number = 0

  constructor(private categoriesService: CategoriesCapsulesService, private router: Router) {
    this.getCategories()
  }

  private handleRequestError(error: any) {
    const msg = 'An error occurred while fetching users';
    this.isLoading = false
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

  ngOnInit() {}

  getCategories() {
    this.isLoading = true
    this.categoriesService.getAllCategoriesTree().subscribe({
      next: (result) => {
        this.categories = result.data.categories
        this.allCategoriesCount = result.data.count
        this.isLoading = false
      },
      error: (error) => this.handleRequestError(error),
    });
  }
  viewCategory(categoryId: string) {
    this.isLoading = true
    this.categoriesService.getCategoryDetails(categoryId).subscribe({
      next: (result) => {
        this.selectedCategory = result.data
        this.isLoading = false
      },
      error: (error) => this.handleRequestError(error),
    });
  }
  manageCategory(type: string, categoryId?: string) {
    this.router.navigate([`/admin985xilinp/dashboard/capsules/manage-categories`], { queryParams: { type: type, categoryId: categoryId },queryParamsHandling: 'merge'  });
  }
}
