import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormControl } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CardCarouselComponent } from '../card-carousel/card-carousel.component';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { Course } from 'src/app/core/models/course.entity';
import { Category } from 'src/app/core/models/category.model';
import { Provider } from 'src/app/core/models/provider.model';
import { CoursesService } from 'src/app/core/services/courses.service';
import { CategoriesService } from 'src/app/core/services/categories.service';
import { LoadingService } from 'src/app/core/services/loading.service';
import { CoursesEventService } from 'src/app/core/services/courses-event.service'; // ADD THIS

@Component({
  selector: 'app-courses-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    CardCarouselComponent
  ],
  templateUrl: './courses-list.component.html',
  styleUrls: ['./courses-list.component.scss']
})
export class CoursesListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  allCourses: Course[] = [];
  filteredCourses: Course[] = [];
  allCategories: Category[] = [];
  allProviders: Provider[] = [];
  filteredProviders: Provider[] = [];

  selectedCategory: Category | null = null;
  selectedProvider: Provider | null = null;

  showCategoryDropdown = false;
  showProviderDropdown = false;

  isLoading = false;

  searchForm: FormGroup;

  // Add filter property
  currentFilter: any = null;

  constructor(
    private fb: FormBuilder,
    private coursesService: CoursesService,
    private categoriesService: CategoriesService,
    private loadingService: LoadingService,
    private route: ActivatedRoute,
    private coursesEventService: CoursesEventService // ADD THIS
  ) {
    this.searchForm = this.fb.group({
      search: ['']
    });
  }

  // Getter for search control
  get searchControl(): FormControl {
    return this.searchForm.get('search') as FormControl;
  }

  ngOnInit(): void {
    this.loadData();
    this.setupSearchListener();
    this.setupRouteListener();

    // Listen to filter events from sidebar
    this.setupFilterListener(); // ADD THIS
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ADD THIS METHOD
  private setupFilterListener(): void {
    this.coursesEventService.filterSubject$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(filter => {
      this.currentFilter = filter;

      if (filter) {
        // Update local filters based on sidebar selection
        if (filter.categoryId) {
          const category = this.allCategories.find(c => c.id === filter.categoryId);
          this.selectedCategory = category || null;
        } else {
          this.selectedCategory = null;
        }

        if (filter.providerId) {
          const provider = this.allProviders.find(p => p.id === filter.providerId);
          this.selectedProvider = provider || null;
        } else {
          this.selectedProvider = null;
        }

        // Apply filters
        this.applyFilters();
      } else {
        // Clear all filters if sidebar is cleared
        this.clearFilters();
      }
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    // Close category dropdown if clicked outside
    if (this.showCategoryDropdown && !target.closest('.category-dropdown') && !target.closest('.category-button')) {
      this.showCategoryDropdown = false;
    }

    // Close provider dropdown if clicked outside
    if (this.showProviderDropdown && !target.closest('.provider-dropdown') && !target.closest('.provider-button')) {
      this.showProviderDropdown = false;
    }
  }

  private loadData(): void {
    this.isLoading = true;

    // Load all courses
    this.coursesService.getAllActiveCourses().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (result) => {
        this.allCourses = result.data.courses || [];
        this.filteredCourses = [...this.allCourses];

        // Extract unique providers from all courses
        this.extractProvidersFromCourses();

        // Load categories
        this.loadCategories();
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.allCourses = [];
        this.filteredCourses = [];
        this.isLoading = false;
      }
    });
  }

  private loadCategories(): void {
    this.categoriesService.getAllWithProviders().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (result) => {
        this.allCategories = result.data.categories || [];
        this.isLoading = false;

        // Check if there's a filter from route or sidebar
        this.checkInitialFilters();
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.allCategories = [];
        this.isLoading = false;
      }
    });
  }

  // ADD THIS METHOD
  private checkInitialFilters(): void {
    // Check if sidebar has already set a filter
    if (this.currentFilter) {
      if (this.currentFilter.categoryId) {
        const category = this.allCategories.find(c => c.id === this.currentFilter.categoryId);
        this.selectedCategory = category || null;
      }

      if (this.currentFilter.providerId) {
        const provider = this.allProviders.find(p => p.id === this.currentFilter.providerId);
        this.selectedProvider = provider || null;
      }

      this.applyFilters();
    }
  }

  private extractProvidersFromCourses(): void {
    const providerMap = new Map<string, Provider>();

    this.allCourses.forEach(course => {
      if (course.provider && course.provider.id) {
        providerMap.set(course.provider.id, course.provider);
      }
    });

    this.allProviders = Array.from(providerMap.values());
    this.filteredProviders = [...this.allProviders];

    // Sort providers alphabetically
    this.allProviders.sort((a, b) => a.name.localeCompare(b.name));
    this.filteredProviders.sort((a, b) => a.name.localeCompare(b.name));
  }

  private setupSearchListener(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.applyFilters();
    });
  }

  private setupRouteListener(): void {
    this.route.queryParams.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      if (params['category']) {
        const category = this.allCategories.find(c => c.id === params['category']);
        if (category) {
          this.selectedCategory = category;
        }
      }
      if (params['provider']) {
        const provider = this.allProviders.find(p => p.id === params['provider']);
        if (provider) {
          this.selectedProvider = provider;
        }
      }
      if (params['search']) {
        this.searchControl.setValue(params['search'], { emitEvent: false });
      }

      this.applyFilters();
    });
  }

  private applyFilters(): void {
    let filtered = [...this.allCourses];
    const searchTerm = this.searchControl.value?.toLowerCase() || '';

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm) ||
        course.details?.toLowerCase().includes(searchTerm) ||
        course.category?.name.toLowerCase().includes(searchTerm) ||
        course.provider?.name.toLowerCase().includes(searchTerm)
      );
    }

    // Apply category filter
    if (this.selectedCategory) {
      filtered = filtered.filter(course =>
        course.category?.id === this.selectedCategory?.id
      );
    }

    // Apply provider filter
    if (this.selectedProvider) {
      filtered = filtered.filter(course =>
        course.provider?.id === this.selectedProvider?.id
      );
    }

    this.filteredCourses = filtered;

    // Update filtered providers based on selected category
    this.updateFilteredProviders();
  }

  private updateFilteredProviders(): void {
    if (this.selectedCategory) {
      // Filter providers that have courses in the selected category
      const providerIdsInCategory = new Set(
        this.allCourses
          .filter(course => course.category?.id === this.selectedCategory?.id)
          .map(course => course.provider?.id)
          .filter(id => id) as string[]
      );

      this.filteredProviders = this.allProviders.filter(provider =>
        providerIdsInCategory.has(provider.id)
      );
    } else {
      this.filteredProviders = [...this.allProviders];
    }
  }

  toggleCategoryDropdown(event: Event): void {
    event.stopPropagation();
    this.showCategoryDropdown = !this.showCategoryDropdown;
    if (this.showCategoryDropdown) {
      this.showProviderDropdown = false;
    }
  }

  toggleProviderDropdown(event: Event): void {
    event.stopPropagation();
    this.showProviderDropdown = !this.showProviderDropdown;
    if (this.showProviderDropdown) {
      this.showCategoryDropdown = false;
    }
  }

  selectCategory(category: Category | null, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.selectedCategory = category;
    this.showCategoryDropdown = false;

    // Reset provider if not compatible with selected category
    if (category && this.selectedProvider) {
      const hasProviderInCategory = this.allCourses.some(course =>
        course.category?.id === category.id &&
        course.provider?.id === this.selectedProvider?.id
      );

      if (!hasProviderInCategory) {
        this.selectedProvider = null;
      }
    }

    this.applyFilters();
  }

  selectProvider(provider: Provider | null, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.selectedProvider = provider;
    this.showProviderDropdown = false;
    this.applyFilters();
  }

  clearFilters(): void {
    this.selectedCategory = null;
    this.selectedProvider = null;
    this.searchControl.setValue('');
    this.applyFilters();

    // Also clear the sidebar filter if it exists
    if (this.currentFilter) {
      this.coursesEventService.clearFilter();
      this.currentFilter = null;
    }
  }
}
