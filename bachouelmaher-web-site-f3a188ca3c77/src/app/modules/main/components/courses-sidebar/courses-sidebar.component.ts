import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SvgIconComponent } from 'angular-svg-icon';
import { Validators } from 'ngx-editor';
import { Category } from 'src/app/core/models/category.model';
import { Provider } from 'src/app/core/models/provider.model';
import { CapsulesEventService } from 'src/app/core/services/capsules-event.service';
import { CapsulesService } from 'src/app/core/services/capsules.service';
import { CategoriesCapsulesService } from 'src/app/core/services/categories-capsules.service';
import { CategoriesService } from 'src/app/core/services/categories.service';
import { CoursesEventService } from 'src/app/core/services/courses-event.service';
import { CoursesService } from 'src/app/core/services/courses.service';
import { LoadingService } from 'src/app/core/services/loading.service';
import { PharmaciesService } from 'src/app/core/services/pharmacies.service';
import { ProvidersService } from 'src/app/core/services/providers.service';

@Component({
  selector: 'app-courses-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, SvgIconComponent],
  templateUrl: './courses-sidebar.component.html',
  styleUrl: './courses-sidebar.component.scss'
})
export class CoursesSidebarComponent {
  @Input() menu! : boolean;
  @Input() mobileMenu! : boolean;
  @Output() data = new EventEmitter<any>();
  categories: any[] = [];
  capsules: any[] = [];
  providers: Provider[] = [];
  selectedCategories: string[] = [];
  selectedProviderIds: string[] = [];
  // searchForm: FormGroup;
  showContent = true
  showCategories = true;
  showProviders = false;
  //courses : any


  filteredCategories: any[] = [];
  courses: any[] = [];

  constructor(private fb: FormBuilder, private coursesService: CoursesService, private coursesEventService: CoursesEventService, private categoriesService: CategoriesService, private pharmaciesService: PharmaciesService, private providersService: ProvidersService, private categorieCapsulesService: CategoriesCapsulesService, private capsulesEventService: CapsulesEventService, private loadingService: LoadingService) {
    // this.searchForm = this.fb.group({
    //   search: [null, Validators.required]
    // });
  }

  ngOnInit(): void {
    /*this.getCategoriesWithProviders()
    this.getCapsulesCategoriesWithProviders()
    // this.getProviders()
    this.mobileMenu = false*/


    this.getAllCourses();
    this.getCapsulesCategoriesWithProviders();
    this.mobileMenu = false;
  }


   getAllCourses(): void {
    this.coursesService.getAllActiveCourses().subscribe({
      next: (result) => {
        this.courses = result.data.courses || [];
        // Now get categories with providers
        this.getCategoriesWithProviders();
      },
      error: (error) => {
        console.error('Error fetching courses:', error);
        this.courses = [];
        this.getCategoriesWithProviders();
      }
    });
  }

  // Method to check if a category has courses
  private categoryHasCourses(categoryId: string): boolean {
    if (!this.courses || this.courses.length === 0) return false;

    return this.courses.some(course =>
      course.category?.id === categoryId || course.categoryId === categoryId
    );
  }

  private categoryOrItsProvidersHaveCourses(category: any): boolean {
    // Check if the category itself has courses
    if (this.categoryHasCourses(category.id)) {
      return true;
    }

    // Check if any provider in this category has courses
    if (category.providers && category.providers.length > 0) {
      return category.providers.some((provider: any) =>
        this.providerHasCourses(provider.id, category.id)
      );
    }

    return false;
  }

  // Method to check if a provider has courses in a specific category
  private providerHasCourses(providerId: string, categoryId: string): boolean {
    if (!this.courses || this.courses.length === 0) return false;

    return this.courses.some(course =>
      (course.provider?.id === providerId || course.providerId === providerId) &&
      (course.category?.id === categoryId || course.categoryId === categoryId)
    );
  }

  // Method to filter providers that have courses in a category
  private filterProvidersWithCourses(providers: any[], categoryId: string): any[] {
    if (!providers || providers.length === 0) return [];

    return providers.filter(provider =>
      this.providerHasCourses(provider.id, categoryId)
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    if(this.menu){
      setTimeout(() => {
        this.showContent = this.menu
      }, 250);
    } else{
      this.showContent = false
    }
  }

  resetFilters(){
    // this.capsulesEventService.setFilter({
    //   categoryId: undefined,
    //   providerId: undefined,
    //   // searchText: undefined
    // });
    // this.capsulesEventService.setFilter({
    //   categoryId: undefined,
    //   providerId: undefined,
    //   // searchText: undefined
    // });


    this.capsulesEventService.clearFilter();
    this.coursesEventService.clearFilter();
    this.toggleMobileMenu();
  }

  // getProviders() {
  //   this.providersService.getAllActiveProviders(1).subscribe({
  //     next: (result) => {
  //       this.providers = result.data.providers
  //     },
  //     error: (error) => {
  //       console.error(error)
  //     }
  //   });
  // }

  getCategoriesWithProviders() {
    this.categoriesService.getAllWithProviders().subscribe({
      next: (result) => {
        const allCategories = result.data.categories || [];

        // Fix: Add type annotation for 'category' parameter
        this.categories = allCategories.filter((category: any) =>
          this.categoryOrItsProvidersHaveCourses(category)
        );

        // Ensure providers array exists for each category
        this.categories.forEach((category: any) => {
          if (!category.providers) {
            category.providers = [];
          }

          if (category.providers.length > 0) {
            category.providers = this.filterProvidersWithCourses(category.providers, category.id);
            category.providers = this.removeDuplicateProviders(category.providers);
          }
        });

        this.filteredCategories = this.categories.filter((category: any) =>
          category.providers && category.providers.length > 0
        );

        console.log('Filtered categories with courses:', this.categories);
      },
      error: (error) => {
        console.error('Error fetching categories:', error);
        this.categories = [];
        this.filteredCategories = [];
      }
    });
  }

  private removeDuplicateProviders(providers: any[]): any[] {
    if (!providers || providers.length === 0) return [];

    const uniqueProviders: any[] = [];
    const seenNames = new Set();

    providers.forEach(provider => {
      if (!seenNames.has(provider.name)) {
        seenNames.add(provider.name);
        uniqueProviders.push(provider);
      }
    });

    return uniqueProviders;
  }

  getCapsulesCategoriesWithProviders() {
    this.categorieCapsulesService.getAllWithProviders().subscribe({
      next: (result) => {
        this.capsules = result.data.categories || [];

        // For capsules, you might want to filter similarly if needed
        // For now, we'll keep all capsules categories
        console.log('Capsules categories:', this.capsules);
      },
      error: (error) => {
        console.error(error);
        this.capsules = [];
      }
    });
  }

  // getCategories() {
  //   this.categoriesService.getAllCategories().subscribe({
  //     next: (result) => {
  //         this.categories = result.data.categories
  //     },
  //     error: (error) => {
  //       console.error(error)
  //     }
  //   });
  // }

  toggleMobileMenu() {
    this.mobileMenu = !this.mobileMenu;
    this.loadingService.setMobileMenu(false);
  }

  toggleCategories() {
    this.showCategories = !this.showCategories;
  }

  toggleProviders() {
    this.showProviders = !this.showProviders;
  }

  // onCategoryChange(categoryId: string, event: Event) {
  //   const target = event.target as HTMLInputElement;
  //   const isChecked = target.checked;

  //   if (isChecked) {
  //     this.selectedCategories.push(categoryId);
  //   } else {
  //     this.selectedCategories = this.selectedCategories.filter(id => id !== categoryId);
  //   }
  //   console.log('Selected Categories:', this.selectedCategories);
  // }

  // onProviderClick(providerId: string) {
  //   const index = this.selectedProviderIds.indexOf(providerId);
  //   if (index === -1) {
  //     this.selectedProviderIds.push(providerId);
  //   } else {
  //     this.selectedProviderIds.splice(index, 1);
  //   }
  //   console.log('Selected Provider IDs:', this.selectedProviderIds);
  // }

  // isSelected(providerId: string): boolean {
  //   return this.selectedProviderIds.includes(providerId);
  // }


  // onSubmit(){
  //   if (this.searchForm.invalid) return;
  //   console.log('Search:', this.searchForm.value)
  // }

  onCategorieSelected(categorie: any): void {
  this.coursesEventService.setFilter({
    categoryId: categorie.id,
    categoryName: categorie.name,
    providerId: undefined,
    providerName: undefined
  });
  this.toggleMobileMenu();
}

  onProviderSelected(provider: any, categorie: any, event: MouseEvent): void {
  event.stopPropagation();
  this.coursesEventService.setFilter({
    categoryId: categorie.id,
    categoryName: categorie.name, // ADD THIS
    providerId: provider.id,
    providerName: provider.name // ADD THIS
  });
  this.toggleMobileMenu();
}

  onCategorieCapsulesSelected(capsule: any): void {
  this.capsulesEventService.setFilter({
    categoryId: capsule.id,
    categoryName: capsule.name, // ADD THIS
    providerId: undefined,
    providerName: undefined
  });
  this.toggleMobileMenu();
}

onProviderCapsulesSelected(provider: any, capsule: any, event: MouseEvent): void {
  event.stopPropagation();
  this.capsulesEventService.setFilter({
    categoryId: capsule.id,
    categoryName: capsule.name, // ADD THIS
    providerId: provider.id,
    providerName: provider.name // ADD THIS
  });
  this.toggleMobileMenu();
}
}
