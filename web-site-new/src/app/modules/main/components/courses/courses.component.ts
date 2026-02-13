import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { CardCarouselComponent } from '../card-carousel/card-carousel.component';
import { CoursesService } from 'src/app/core/services/courses.service';
import { Course } from 'src/app/core/models/course.entity';
import { MainLoaderComponent } from "../loader/loader.component";
import { CoursesEventService } from 'src/app/core/services/courses-event.service';
import { CardShortsComponent } from "../card-shorts/card-shorts.component";
import { CapsulesService } from 'src/app/core/services/capsules.service';
import { Capsule } from 'src/app/core/models/capsule.model';
import { CapsulesEventService } from 'src/app/core/services/capsules-event.service';

@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.scss'],
  standalone: true,
  imports: [CommonModule, CardCarouselComponent, MainLoaderComponent, CardShortsComponent]
})
export class CoursesComponent {

  newCourses: Course[] = []; // Courses < 7 days old
  inProgressCourses: Course[] = []; // Courses with progress < 100%

  allCourses: Course[] = [];


  showNewCourses = false;
  showInProgressCourses = false;
  showAllCourses = false;


  courses: Course[] = [];
  capsules: Capsule[] = [];
  isLoading = false;
  isLoadingCourses = false;
  isLoadingCapsules = false;

  // Add these properties
  sectionTitle: string = 'Toutes les Formations';
  currentFilter: any = null;

   // New properties for enhanced UX
  showFilterModal = false;
  totalHours = 0;
  newThisWeek = 0;

  constructor(
    private coursesService: CoursesService,
    private coursesEventService: CoursesEventService,
    private capsulesService: CapsulesService,
    private capsulesEventService: CapsulesEventService,
    private cdRef: ChangeDetectorRef
  ) {
    // Gestion du filtre pour les cours
    this.coursesEventService.filterSubject$.subscribe(filter => {
      this.currentFilter = filter;
      this.isLoadingCourses = true;
      this.isLoading = true;

      // Update title based on filter
      this.updateSectionTitle(filter);

      if (filter) {
        this.fetchAllCourses(filter.categoryId, filter.providerId);
      } else {
        this.fetchAllCourses();
      }
    });

    // Gestion du filtre pour les capsules
    this.capsulesEventService.filterSubject$.subscribe(filter => {
      this.isLoadingCapsules = true;
      this.isLoading = true;
      if (filter) {
        this.fetchCapsules(filter.categoryId, filter.providerId);
      } else {
        this.fetchCapsules();
      }
    });
  }

   ngOnInit() {
    this.isLoading = true;
    this.fetchAllCourses();
    this.fetchCapsules();
  }

  private isNewCourse(course: Course): boolean {
    if (!course.createdAt) return false;

    const createdDate = new Date(course.createdAt);
    const currentDate = new Date();
    const timeDifference = currentDate.getTime() - createdDate.getTime();
    const daysDifference = timeDifference / (1000 * 3600 * 24);

    return daysDifference < 7;
  }

  private organizeCourses(courses: Course[]): void {
    // Clear existing arrays
    this.newCourses = [];
    this.inProgressCourses = [];
    this.allCourses = courses; // Store all courses

    // Filter new courses
    this.newCourses = courses.filter(course => this.isNewCourse(course));

    // Note: In-progress courses will be handled by the CardCarouselComponent
    // as it already has access to user enrollment data

    // Update section visibility
    this.showNewCourses = this.newCourses.length > 0;
    this.showAllCourses = this.allCourses.length > 0;

    // Note: showInProgressCourses will be handled by CardCarouselComponent
    // based on whether user has in-progress courses
  }


  private fetchAllCourses(categorieId?: string, providerId?: string): void {
    this.isLoadingCourses = true;
    this.isLoading = true;

    const coursesObservable = categorieId || providerId
      ? this.coursesService.getAllCoursesWithCatgorieOrProvider(categorieId, providerId)
      : this.coursesService.getAllActiveCourses();

    coursesObservable.subscribe({
      next: (result) => {
        this.organizeCourses(result.data.courses);
        this.isLoadingCourses = false;
        this.isLoading = this.isLoadingCourses && this.isLoadingCapsules;



        this.cdRef.detectChanges();
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des cours:', error);
        this.isLoadingCourses = false;
        this.isLoading = this.isLoadingCourses && this.isLoadingCapsules;
        this.cdRef.detectChanges();
      }
    });
  }

  // Method to update section title based on filter
  private updateSectionTitle(filter: any): void {
  if (!filter) {
    this.sectionTitle = 'Toutes les Formations';
    return;
  }

  // Build title based on filter
  let title = '';

  if (filter.categoryName && filter.providerName) {
    title = `${filter.categoryName} - ${filter.providerName}`;
  } else if (filter.categoryName) {
    title = filter.categoryName;
  } else if (filter.providerName) {
    title = `Formations - ${filter.providerName}`;
  } else {
    title = 'Formations filtrées';
  }

  this.sectionTitle = title;
}

  clearFilters(): void {
  this.sectionTitle = 'Toutes les Formations'; // Change from 'Nouvelles Formations'
  this.currentFilter = null;
  this.coursesEventService.clearFilter();
}


  private fetchCourses(categorieId?: string, providerId?: string): void {
    this.isLoadingCourses = true;
    this.isLoading = true;
    const coursesObservable = categorieId || providerId
      ? this.coursesService.getAllCoursesWithCatgorieOrProvider(categorieId, providerId)
      : this.coursesService.getAllActiveCourses();

    coursesObservable.subscribe({
      next: (result) => {
        this.courses = result.data.courses;
        this.isLoadingCourses = false;
        this.isLoading = this.isLoadingCourses && this.isLoadingCapsules;

        // Try to get category name from the first course if we have categoryId filter
        if (categorieId && this.courses.length > 0 && this.courses[0].category) {
          this.sectionTitle = this.courses[0].category.name;
        }

        this.cdRef.detectChanges();
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des cours:', error);
        this.isLoadingCourses = false;
        this.isLoading = this.isLoadingCourses && this.isLoadingCapsules;
        this.cdRef.detectChanges();
      }
    });
  }

  private fetchCapsules(categorieId?: string, providerId?: string): void {
    this.isLoadingCapsules = true;
    this.isLoading = true;

    const capsulesObservable = categorieId || providerId
      ? this.capsulesService.getAllCapsulesWithCatgorieOrProvider(categorieId, providerId)
      : this.capsulesService.getAllActiveCapsules('1');

    capsulesObservable.subscribe({
      next: (result) => {
        this.capsules = result.data.capsules;
        this.isLoadingCapsules = false;
        this.isLoading = this.isLoadingCapsules && this.isLoadingCourses;
        this.cdRef.detectChanges();
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des capsules:', error);
        this.isLoadingCapsules = false;
        this.isLoading = this.isLoadingCapsules && this.isLoadingCourses;
        this.cdRef.detectChanges();
      }
    });
  }

  // New methods for enhanced UX
  hasInProgressCourses(): boolean {
    return this.inProgressCourses && this.inProgressCourses.length > 0;
  }

  getTotalCourses(): number {
    return this.allCourses.length;
  }

  getTotalHours(): number {
    return this.totalHours;
  }

  getNewThisWeek(): number {
    return this.newThisWeek;
  }

  openFilterModal(): void {
    this.showFilterModal = true;
    // You'll need to implement the filter modal component
  }

  openSortOptions(): void {
    // Implement sort functionality
    console.log('Opening sort options');
  }
  getFilterDisplayName(): string {
    if (!this.currentFilter) return '';

    if (this.currentFilter.categoryName && this.currentFilter.providerName) {
      return `${this.currentFilter.categoryName}, ${this.currentFilter.providerName}`;
    } else if (this.currentFilter.categoryName) {
      return this.currentFilter.categoryName;
    } else if (this.currentFilter.providerName) {
      return this.currentFilter.providerName;
    }

    return 'Filtre appliqué';
  }
}
