import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProfileHeaderComponent } from "../profile-header/profile-header.component";
import { CommonModule } from '@angular/common';
import { CardCarouselComponent } from "../card-carousel/card-carousel.component";
import { EducationalTeamComponent } from "../educational-team/educational-team.component";
import { CourseReviewComponent } from "../course-review/course-review.component";
import { CourseSummaryCardComponent } from "../course-summary-card/course-summary-card.component";
import { Course } from 'src/app/core/models/course.entity';
import { CoursesService } from 'src/app/core/services/courses.service';
import { MainLoaderComponent } from "../loader/loader.component";

import { VgApiService, VgCoreModule } from '@videogular/ngx-videogular/core'
import { VgControlsModule } from '@videogular/ngx-videogular/controls'
import { VgOverlayPlayModule } from '@videogular/ngx-videogular/overlay-play'
import { VgBufferingModule } from '@videogular/ngx-videogular/buffering'
import { LoadingService } from 'src/app/core/services/loading.service';
import { VimeoPlayerComponent } from "../vimeo-player/vimeo-player.component";
import { RatingsService } from 'src/app/core/services/ratings.service';
import { AlertComponent } from "../alert/alert.component";
import { CoursesEventService } from 'src/app/core/services/courses-event.service';
import { AccessDeniedPopupComponent } from "../access-denied-popup/access-denied-popup.component";
import { AuthService } from 'src/app/core/services/auth.service';
import { UsersService } from 'src/app/core/services/users.service';


@Component({
  selector: 'app-course-details',
  standalone: true,
  imports: [RouterModule, CommonModule, CardCarouselComponent, EducationalTeamComponent, CourseReviewComponent, CourseSummaryCardComponent, MainLoaderComponent, VgCoreModule, VgControlsModule, VgOverlayPlayModule, VgBufferingModule, VimeoPlayerComponent, AlertComponent, AccessDeniedPopupComponent],
  templateUrl: './course-details.component.html',
  styleUrl: './course-details.component.scss'
})

export class CourseDetailsComponent {
 isLoading = false
  coursId: any;
  courses: Course[] = [];
  cours: Course | undefined
  isTextVisible: boolean[] = [];
  preload: string = 'auto'
  rating: any
  api: VgApiService = new VgApiService
  handleErrorResponse = false;
  handleResponse = false;
  handleError = false;
  alertMessage = '';
  showMessage = false
  details: any;
  status = false
  isPopupVisible = false;

  // User and subscription data
  currentUser: any;
  userPlan: any;
  canAccessCourse: boolean = false;
  showUpgradePopup: boolean = false;
  accessDeniedMessage: string = '';

  // Access status
  accessStatus: 'free' | 'subscribed' | 'no_access' | 'upgrade_needed' = 'no_access';

  constructor(private route: ActivatedRoute,
              private coursesService: CoursesService,
              private coursesEventService: CoursesEventService,
              private authService: AuthService,
              private usersService: UsersService,
              private router: Router) {
  }

  ngOnInit(): void {
    this.isLoading = true
    this.coursId = this.route.snapshot.paramMap.get('id');
    this.isTextVisible = new Array(this.cours?.faqs.length).fill(false);

    // Get current user
    this.currentUser = this.authService.getUser();

    // Get user's subscription plan only if user is PHARMACIST_HOLDER
    if (this.currentUser && this.authService.getRole() === 'PHARMACIST_HOLDER') {
      this.getUserPlan();
    }

    this.coursesService.getAllActiveCourses(3).subscribe({
      next: (result) => {
        if (result.status) {
          this.courses = result.data.courses
        }
      },
      error: (error) => {
        console.error(error)
      }
    });

    this.coursesService.getActiveCourseDetails(this.coursId).subscribe({
      next: (result) => {
        if (result.status) {
          this.cours = result.data
          const sectionWithPositionZero = this.cours?.sections.find(section => section.position === 0);
          this.details = this.cours?.previewVideo;
          this.status = true
          this.checkCourseAccess();
        } else {
          this.showMessage = true
        }
      },
      error: (error) => {
        console.error(error)
      }
    });

    setTimeout(() => {
      this.isLoading = false
    }, 2000);
  }

  // Get user's subscription plan
  getUserPlan() {
    this.usersService.getUserPlan().subscribe({
      next: (res) => {
        if (res.status) {
          this.userPlan = res.data;
          // Re-check access after getting plan
          this.checkCourseAccess();
        }
      },
      error: (error) => {
        console.error('Error getting user plan:', error);
      }
    });
  }

  // Check if user can access the course
  checkCourseAccess() {
    if (!this.cours) {
      this.accessStatus = 'no_access';
      this.canAccessCourse = false;
      return;
    }

    // If course is FREE, everyone can access
    if (this.cours.free) {
      this.accessStatus = 'free';
      this.canAccessCourse = true;
      return;
    }

    // If course is PAID/PREMIUM
    if (!this.cours.free) {
      // Check if user is authenticated
      if (!this.authService.isAuthenticated()) {
        this.accessStatus = 'no_access';
        this.canAccessCourse = false;
        this.accessDeniedMessage = 'Veuillez vous connecter pour accéder à ce cours.';
        return;
      }

      // Get user role
      const userRole = this.authService.getRole();

      // PHARMACIST_HOLDER - Only role that can have subscription
      if (userRole === 'PHARMACIST_HOLDER') {
        // Check if they have an active subscription
        if (this.userPlan && this.userPlan.hasActiveSubscription) {
          this.accessStatus = 'subscribed';
          this.canAccessCourse = true;
        } else {
          // Pharmacist holder without subscription needs to upgrade
          this.accessStatus = 'upgrade_needed';
          this.canAccessCourse = false;
          this.accessDeniedMessage = 'Vous devez souscrire à un abonnement pour accéder aux cours Premium.';
        }
      }
      // Other roles (PHARMACIST, PREPARER, STUDENT) - Cannot have subscription
      else {
        // These roles cannot access premium courses at all
        this.accessStatus = 'no_access';
        this.canAccessCourse = false;
        this.accessDeniedMessage = 'Seuls les pharmaciens titulaires peuvent accéder aux cours Premium.';
      }
    }
  }

  startCourse() {
    if (!this.canAccessCourse) {
      // Pharmacist holder without subscription - redirect to subscription page
      if (this.accessStatus === 'upgrade_needed' && this.authService.getRole() === 'PHARMACIST_HOLDER') {
        this.router.navigate(['/profile/subscription']);
      } else {
        // All other access denied cases - show popup
        this.isPopupVisible = true;
      }
      return;
    }

    // Navigate to course player
    this.router.navigate([`/notre-plateforme/lecture-cours/${this.coursId}`]);
  }

  // Navigate to subscription plans
  goToPlans() {
    this.router.navigate(['/notre-plateforme/abonnements']);
    this.showUpgradePopup = false;
  }

  showAlert(alertType: 'handleResponse' | 'handleError' | 'handleErrorResponse') {
    const messages: { [key: string]: string } = {
      handleErrorResponse: 'Accès refusé : vous n\'êtes pas autorisé à suivre ce cours.',
      handleError: 'Une erreur s\'est produite.'
    };

    this[alertType] = true;
    this.alertMessage = messages[alertType];

    setTimeout(() => {
      this[alertType] = false;
      this.alertMessage = '';
    }, 3000);
  }

  onPlayerReady(source: VgApiService) {
    this.api = source;
    this.api.getDefaultMedia().subscriptions.loadedMetadata.subscribe(this.autoplay.bind(this));
  }

  autoplay() {
    // this.api.play();
  }

  toggleFAQ(index: number) {
    this.isTextVisible[index] = !this.isTextVisible[index];
  }

  formatDuration(duration?: string): string {
    if (!duration) return '00h 00 minutes';

    const [hours, minutes] = duration.split(':').map(Number);

    if (hours === 0) {
      return `${minutes} minutes`;
    }
    return `${hours}h ${minutes} minutes`;
  }

  onShowAlert() {
    this.isPopupVisible = true;
  }

  closePopup() {
    this.isPopupVisible = false;
  }
}
