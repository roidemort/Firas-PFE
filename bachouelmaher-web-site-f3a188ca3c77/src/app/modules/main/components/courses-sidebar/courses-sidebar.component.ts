import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SvgIconComponent } from 'angular-svg-icon';
import { CapsulesEventService } from 'src/app/core/services/capsules-event.service';
import { CategoriesCapsulesService } from 'src/app/core/services/categories-capsules.service';
import { CategoriesService } from 'src/app/core/services/categories.service';
import { CoursesEventService } from 'src/app/core/services/courses-event.service';
import { CoursesService } from 'src/app/core/services/courses.service';
import { LoadingService } from 'src/app/core/services/loading.service';

@Component({
  selector: 'app-courses-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SvgIconComponent],
  templateUrl: './courses-sidebar.component.html',
  styleUrl: './courses-sidebar.component.scss'
})
export class CoursesSidebarComponent {
  @Input() menu!: boolean;
  @Input() mobileMenu!: boolean;
  @Output() data = new EventEmitter<any>();

  categories: any[] = [];
  capsules: any[] = [];

  showContent = true;

  // Selected values
  selectedCategoryId: string = '';
  selectedCategoryName: string = '';
  selectedProviderId: string = '';
  selectedProviderName: string = '';

  selectedCapsuleId: string = '';
  selectedCapsuleName: string = '';
  selectedCapsuleProviderId: string = '';
  selectedCapsuleProviderName: string = '';

  // Store providers per category
  categoryProvidersMap: Map<string, any[]> = new Map();
  capsuleProvidersMap: Map<string, any[]> = new Map();

  constructor(
    private coursesService: CoursesService,
    private coursesEventService: CoursesEventService,
    private categoriesService: CategoriesService,
    private categorieCapsulesService: CategoriesCapsulesService,
    private capsulesEventService: CapsulesEventService,
    private loadingService: LoadingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getCategories();
    this.getCapsules();
    this.mobileMenu = false;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.menu) {
      setTimeout(() => {
        this.showContent = this.menu
      }, 250);
    } else {
      this.showContent = false
    }
  }

  getCategories() {
    this.categoriesService.getAllWithProviders().subscribe({
      next: (result) => {
        this.categories = result.data.categories || [];

        // Build providers map
        this.categories.forEach((category: any) => {
          if (category.providers && category.providers.length > 0) {
            const uniqueProviders = this.removeDuplicates(category.providers);
            this.categoryProvidersMap.set(category.id, uniqueProviders);
          } else {
            this.categoryProvidersMap.set(category.id, []);
          }
        });
      },
      error: (error) => {
        console.error('Error fetching categories:', error);
        this.categories = [];
      }
    });
  }

  getCapsules() {
    this.categorieCapsulesService.getAllWithProviders().subscribe({
      next: (result) => {
        this.capsules = result.data.categories || [];

        // Build providers map for capsules
        this.capsules.forEach((capsule: any) => {
          if (capsule.providers && capsule.providers.length > 0) {
            const uniqueProviders = this.removeDuplicates(capsule.providers);
            this.capsuleProvidersMap.set(capsule.id, uniqueProviders);
          } else {
            this.capsuleProvidersMap.set(capsule.id, []);
          }
        });
      },
      error: (error) => {
        console.error(error);
        this.capsules = [];
      }
    });
  }

  getProvidersForSelectedCategory(): any[] {
    if (!this.selectedCategoryId) return [];
    return this.categoryProvidersMap.get(this.selectedCategoryId) || [];
  }

  getProvidersForSelectedCapsule(): any[] {
    if (!this.selectedCapsuleId) return [];
    return this.capsuleProvidersMap.get(this.selectedCapsuleId) || [];
  }

  onCategoryChange() {
    // Reset provider when category changes
    this.selectedProviderId = '';
    this.selectedProviderName = '';

    // Find selected category name
    const category = this.categories.find(c => c.id === this.selectedCategoryId);
    this.selectedCategoryName = category?.name || '';

    // Apply filter
    this.applyCourseFilter();
  }

  onProviderChange() {
    // Find selected provider name
    const providers = this.getProvidersForSelectedCategory();
    const provider = providers.find(p => p.id === this.selectedProviderId);
    this.selectedProviderName = provider?.name || '';

    // Apply filter
    this.applyCourseFilter();
  }

  applyCourseFilter() {
    this.coursesEventService.setFilter({
      categoryId: this.selectedCategoryId || undefined,
      categoryName: this.selectedCategoryName || undefined,
      providerId: this.selectedProviderId || undefined,
      providerName: this.selectedProviderName || undefined
    });

    // Close mobile menu if open
    if (this.mobileMenu) {
      this.toggleMobileMenu();
    }
  }

  onCapsuleChange() {
    // Reset capsule provider
    this.selectedCapsuleProviderId = '';
    this.selectedCapsuleProviderName = '';

    // Find selected capsule name
    const capsule = this.capsules.find(c => c.id === this.selectedCapsuleId);
    this.selectedCapsuleName = capsule?.name || '';

    // Apply filter
    this.applyCapsuleFilter();
  }

  onCapsuleProviderChange() {
    // Find selected provider name
    const providers = this.getProvidersForSelectedCapsule();
    const provider = providers.find(p => p.id === this.selectedCapsuleProviderId);
    this.selectedCapsuleProviderName = provider?.name || '';

    // Apply filter
    this.applyCapsuleFilter();
  }

  applyCapsuleFilter() {
    this.capsulesEventService.setFilter({
      categoryId: this.selectedCapsuleId || undefined,
      categoryName: this.selectedCapsuleName || undefined,
      providerId: this.selectedCapsuleProviderId || undefined,
      providerName: this.selectedCapsuleProviderName || undefined
    });

    // Close mobile menu if open
    if (this.mobileMenu) {
      this.toggleMobileMenu();
    }
  }

  clearCategoryFilter() {
    this.selectedCategoryId = '';
    this.selectedCategoryName = '';
    this.selectedProviderId = '';
    this.selectedProviderName = '';
    this.applyCourseFilter();
  }

  clearProviderFilter() {
    this.selectedProviderId = '';
    this.selectedProviderName = '';
    this.applyCourseFilter();
  }

  removeDuplicates(providers: any[]): any[] {
    if (!providers || providers.length === 0) return [];

    const unique = new Map();
    providers.forEach(provider => {
      unique.set(provider.id, provider);
    });

    return Array.from(unique.values());
  }

  resetFilters() {
    // Reset all selections
    this.selectedCategoryId = '';
    this.selectedCategoryName = '';
    this.selectedProviderId = '';
    this.selectedProviderName = '';
    this.selectedCapsuleId = '';
    this.selectedCapsuleName = '';
    this.selectedCapsuleProviderId = '';
    this.selectedCapsuleProviderName = '';

    // Clear filters
    this.capsulesEventService.clearFilter();
    this.coursesEventService.clearFilter();

    this.router.navigate(['/notre-plateforme/cours'], {
      queryParams: {}
    });

    this.toggleMobileMenu();
  }

  toggleMobileMenu() {
    this.mobileMenu = !this.mobileMenu;
    this.loadingService.setMobileMenu(false);
  }
}
