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
  courses: Course[] = [];
  capsules: Capsule[] = [];
  isLoading = false;
  isLoadingCourses = false;
  isLoadingCapsules = false;

  // Add these properties
  sectionTitle: string = 'Nouvelles Formations';
  currentFilter: any = null;

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
        this.fetchCourses(filter.categoryId, filter.providerId);
      } else {
        this.fetchCourses();
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
    this.fetchCourses(); // Chargement initial des cours
    this.fetchCapsules(); // Chargement initial des capsules
  }

  // Method to update section title based on filter
  private updateSectionTitle(filter: any): void {
  if (!filter) {
    this.sectionTitle = 'Nouvelles Formations';
    return;
  }

  // Use categoryName from filter if available
  if (filter.categoryName) {
    this.sectionTitle = filter.categoryName;
  }
  // Use providerName if no category
  else if (filter.providerName && !filter.categoryId) {
    this.sectionTitle = `Formations - ${filter.providerName}`;
  }
  // If both category and provider
  else if (filter.categoryName && filter.providerName) {
    this.sectionTitle = `${filter.categoryName} - ${filter.providerName}`;
  }
  // Fallback
  else {
    this.sectionTitle = 'Formations filtrées';
  }
}

  // Method to clear filters
  clearFilters(): void {
    this.sectionTitle = 'Nouvelles Formations';
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
}
