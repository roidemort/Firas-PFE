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
  isLoading = false
  isLoadingCourses = false;  // Pour le chargement des cours
  isLoadingCapsules = false; // Pour le chargement des capsules

  constructor(
    private coursesService: CoursesService,
    private coursesEventService: CoursesEventService,
    private capsulesService: CapsulesService,
    private capsulesEventService: CapsulesEventService,
    private cdRef: ChangeDetectorRef
  ) {
    // Gestion du filtre pour les cours
    this.coursesEventService.filterSubject$.subscribe(filter => {
      this.isLoadingCourses = true; // Active le loader pour les cours
      this.isLoading = true
      if (filter) {
        this.fetchCourses(filter.categoryId, filter.providerId);
      } else {
        this.fetchCourses();
      }
    });

    // Gestion du filtre pour les capsules
    this.capsulesEventService.filterSubject$.subscribe(filter => {
      this.isLoadingCapsules = true; // Active le loader pour les capsules
      this.isLoading = true
      if (filter) {
        this.fetchCapsules(filter.categoryId, filter.providerId);
      } else {
        this.fetchCapsules();
      }
    });
  }

  ngOnInit() {
    this.isLoading = true
    this.fetchCourses(); // Chargement initial des cours
    this.fetchCapsules(); // Chargement initial des capsules
  }

  private fetchCourses(categorieId?: string, providerId?: string): void {
    this.isLoadingCourses = true; // Active le loader pour les cours
    this.isLoading = true
    const coursesObservable = categorieId || providerId
      ? this.coursesService.getAllCoursesWithCatgorieOrProvider(categorieId, providerId)
      : this.coursesService.getAllActiveCourses();

    coursesObservable.subscribe({
      next: (result) => {
        this.courses = result.data.courses;
        this.isLoadingCourses = false;
        this.isLoading = this.isLoadingCourses && this.isLoadingCapsules // Désactive le loader après récupération
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des cours:', error);
        this.isLoadingCourses = false; // Désactive même en cas d'erreur
        this.isLoading = this.isLoadingCourses && this.isLoadingCapsules 
      }
    });
  }

  private fetchCapsules(categorieId?: string, providerId?: string): void {
    this.isLoadingCapsules = true; // Active le loader pour les capsules
    this.isLoading = true

    const capsulesObservable = categorieId || providerId
      ? this.capsulesService.getAllCapsulesWithCatgorieOrProvider(categorieId, providerId)
      : this.capsulesService.getAllActiveCapsules('1');

    capsulesObservable.subscribe({
      next: (result) => {
        this.capsules = result.data.capsules;
        this.isLoadingCapsules = false; // Désactive le loader après récupération
        this.isLoading = this.isLoadingCapsules && this.isLoadingCourses 
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des capsules:', error);
        this.isLoadingCapsules = false; // Désactive même en cas d'erreur
        this.isLoading = this.isLoadingCapsules && this.isLoadingCourses 
      }
    });
  }
}

//   constructor(private coursesService: CoursesService, private coursesEventService: CoursesEventService, private capsulesService: CapsulesService, private capsulesEventService: CapsulesEventService){
//     this.coursesEventService.filterSubject$.subscribe(filter => {
//       this.isLoading = true
//       if (filter) {
//         this.fetchCourses(filter.categoryId, filter.providerId);
//       } else {
//         this.fetchCourses();
//       }
//     });

//     this.capsulesEventService.filterSubject$.subscribe(filter => {
//       this.isLoading = true
//       if (filter) {
//         this.fetchCapsules(filter.categoryId, filter.providerId);
//       } else {
//         this.fetchCapsules();
//       }
//     });
//   }

//   ngOnInit(){
//     this.isLoading = true
//     this.coursesService.getAllActiveCourses().subscribe({
//       next: (result) => {
//         this.courses = result.data.courses
//         //this.isLoading = false
//       },
//       error: (error) => {
//         console.error(error)
//       }
//     });

//     this.capsulesService.getAllActiveCapsules('1').subscribe({
//       next: (result) => {
//         this.capsules = result.data.capsules
//         //this.isLoading = false
//       },
//       error: (error) => {
//         console.error(error)
//       }
//     });
//   }

//   private fetchCourses(categorieId?: string, providerId?: string): void {
//     this.coursesService.getAllCoursesWithCatgorieOrProvider(categorieId, providerId).subscribe({
//       next: (result) => {
//         this.courses = result.data.courses;
//        // this.isLoading = false
//       },
//       error: (error) => {
//         console.error(error);
//       }
//     });
//   }

//   private fetchCapsules(categorieId?: string, providerId?: string): void {
//     this.capsulesService.getAllCapsulesWithCatgorieOrProvider(categorieId, providerId).subscribe({
//       next: (result) => {
//         this.capsules = result.data.capsules;
//         //this.isLoading = false
//       },
//       error: (error) => {
//         console.error(error);
//       }
//     });
//   }
// }

