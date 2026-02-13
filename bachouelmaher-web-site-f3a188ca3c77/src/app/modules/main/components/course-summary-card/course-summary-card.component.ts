import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SvgIconComponent } from 'angular-svg-icon';
import { User } from 'src/app/core/models/user.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { CoursesEventService } from 'src/app/core/services/courses-event.service';
import { CoursesService } from 'src/app/core/services/courses.service';
import { LocalStorageService } from 'src/app/core/services/localstorage.service';
import { UsersService } from 'src/app/core/services/users.service';

@Component({
  selector: 'app-course-summary-card',
  standalone: true,
  imports: [RouterModule, CommonModule, SvgIconComponent],
  templateUrl: './course-summary-card.component.html',
  styleUrl: './course-summary-card.component.scss'
})
export class CourseSummaryCardComponent {
   @Input() cours!: any;
  @Output() showAlert = new EventEmitter<any>();

  currentUser: User | null = null;
  subscription: any;
  canAccessCourse: boolean = false;
  accessStatus: 'free' | 'subscribed' | 'no_access' | 'upgrade_needed' = 'no_access';
  isLoading: boolean = false;
  pharmacyHolder: User | null = null;
  isCheckingAccess: boolean = true;

  constructor(
    private router: Router,
    private authService: AuthService,
    private coursesService: CoursesService,
    private coursesEventService: CoursesEventService,
    private localStorageService: LocalStorageService,
    private usersService: UsersService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getUser();
    this.checkAccess();
  }

  // Check if user can access the course
  checkAccess() {
    this.isCheckingAccess = true;

    if (!this.cours) {
      this.canAccessCourse = false;
      this.accessStatus = 'no_access';
      this.isCheckingAccess = false;
      return;
    }

    // If course is FREE, everyone can access
    if (this.cours.free === true) {
      this.canAccessCourse = true;
      this.accessStatus = 'free';
      this.isCheckingAccess = false;
      return;
    }

    // If course is PAID/PREMIUM
    if (this.cours.free === false) {
      // Check if user is authenticated
      if (!this.authService.isAuthenticated()) {
        this.canAccessCourse = false;
        this.accessStatus = 'no_access';
        this.isCheckingAccess = false;
        return;
      }

      const userRole = this.authService.getRole();

      // CASE 1: User is PHARMACIST_HOLDER - check their own subscription
      if (userRole === 'PHARMACIST_HOLDER') {
        this.getUserSubscription();
      }
      // CASE 2: User is other role (PHARMACIST, PREPARER, STUDENT) - check pharmacy holder's subscription
      else {
        this.checkPharmacySubscription();
      }
    }
  }

  // Get subscription for PHARMACIST_HOLDER
  getUserSubscription() {
    this.usersService.getMyPlanDetails().subscribe({
      next: (res: any) => {
        if (res.status && res.data?.subscription) {
          this.subscription = res.data.subscription;
          this.checkSubscriptionValidity();
        } else {
          // No subscription found
          this.canAccessCourse = false;
          this.accessStatus = 'upgrade_needed';
          this.isCheckingAccess = false;
        }
      },
      error: (error: any) => {
        console.error('Error getting subscription:', error);
        this.canAccessCourse = false;
        this.accessStatus = 'no_access';
        this.isCheckingAccess = false;
      }
    });
  }

  // Check subscription for non-holder users (find pharmacy holder and their subscription)
  checkPharmacySubscription() {
    // Get all users in the same pharmacy (team)
    this.usersService.getMyTeam().subscribe({
      next: (teamRes: any) => {
        if (teamRes.status && teamRes.data?.users) {
          // Find the PHARMACIST_HOLDER in the team with proper typing
          this.pharmacyHolder = teamRes.data.users.find((user: User) => user.role === 'PHARMACIST_HOLDER');

          if (this.pharmacyHolder) {
            // Get the holder's subscription details
            this.usersService.getMyPlanDetails().subscribe({
              next: (planRes: any) => {
                if (planRes.status && planRes.data?.subscription) {
                  this.subscription = planRes.data.subscription;

                  // Check if current user is in the subscription's users array
                  const isUserInSubscription = this.subscription.users?.some(
                    (user: User) => user.id === this.currentUser?.id
                  );

                  // Also check if subscription is still valid (not ended)
                  const isSubscriptionValid = this.isSubscriptionActive(this.subscription);

                  if (isUserInSubscription && isSubscriptionValid) {
                    this.canAccessCourse = true;
                    this.accessStatus = 'subscribed';
                  } else {
                    this.canAccessCourse = false;
                    this.accessStatus = 'no_access';
                  }
                } else {
                  // Holder has no subscription
                  this.canAccessCourse = false;
                  this.accessStatus = 'no_access';
                }
                this.isCheckingAccess = false;
              },
              error: () => {
                this.canAccessCourse = false;
                this.accessStatus = 'no_access';
                this.isCheckingAccess = false;
              }
            });
          } else {
            // No pharmacist holder found in this pharmacy
            this.canAccessCourse = false;
            this.accessStatus = 'no_access';
            this.isCheckingAccess = false;
          }
        } else {
          this.canAccessCourse = false;
          this.accessStatus = 'no_access';
          this.isCheckingAccess = false;
        }
      },
      error: () => {
        this.canAccessCourse = false;
        this.accessStatus = 'no_access';
        this.isCheckingAccess = false;
      }
    });
  }

  // Check if subscription is active (not ended)
  isSubscriptionActive(subscription: any): boolean {
    if (!subscription) return false;

    const endedAt = new Date(subscription.endedAt);
    const now = new Date();

    // Status 1 = active
    return subscription.status === 1 && endedAt > now;
  }

  // Check subscription validity for PHARMACIST_HOLDER
  checkSubscriptionValidity() {
    if (this.subscription && this.isSubscriptionActive(this.subscription)) {
      this.canAccessCourse = true;
      this.accessStatus = 'subscribed';
    } else {
      this.canAccessCourse = false;
      this.accessStatus = 'upgrade_needed';
    }
    this.isCheckingAccess = false;
  }

  startLearning() {
    // If still checking access, do nothing
    if (this.isCheckingAccess) {
      return;
    }

    // If course is free, allow enrollment directly
    if (this.cours.free === true) {
      this.enrollInCourse();
      return;
    }

    // For paid courses, check access
    if (!this.canAccessCourse) {
      const userRole = this.authService.getRole();

      // Pharmacist holder without subscription - redirect to subscription page
      if (userRole === 'PHARMACIST_HOLDER' && this.accessStatus === 'upgrade_needed') {
        this.router.navigate(['/profile/subscription']);
      } else {
        // All other access denied cases - show popup
        this.showAlert.emit(true);
      }
      return;
    }

    // User has access, enroll in course
    this.enrollInCourse();
  }

  enrollInCourse() {
    this.isLoading = true;
    this.coursesService.getEnrollCourse(this.cours.id).subscribe({
      next: (result: any) => {
        this.isLoading = false;
        if (result.status) {
          localStorage.setItem('enrollCourse', JSON.stringify(result.data.EnrollCourse));
          this.router.navigate(["/notre-plateforme/cours/apprentissage/" + this.cours.id]);
        } else {
          this.showAlert.emit(true);
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error(error);
        this.showAlert.emit(true);
      }
    });
  }

  // Helper methods for template
  isFreeCourse(): boolean {
    return this.cours?.free === true;
  }

  isPaidCourse(): boolean {
    return this.cours?.free === false;
  }

  isPharmacistHolder(): boolean {
    return this.authService.getRole() === 'PHARMACIST_HOLDER';
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  getButtonText(): string {
    if (this.isLoading) {
      return 'Chargement...';
    }

    if (this.isCheckingAccess) {
      return 'Vérification...';
    }

    if (!this.isAuthenticated()) {
      return 'Se connecter pour commencer';
    }

    if (this.isFreeCourse()) {
      return 'Commencer';
    }

    if (this.isPaidCourse()) {
      if (this.isPharmacistHolder()) {
        if (this.accessStatus === 'subscribed') {
          return 'Commencer';
        } else {
          return 'Souscrire à un abonnement';
        }
      } else {
        if (this.accessStatus === 'subscribed') {
          return 'Commencer';
        } else {
          return 'Non autorisé';
        }
      }
    }

    return 'Commencer';
  }

  isButtonDisabled(): boolean {
    if (this.isLoading || this.isCheckingAccess) {
      return true;
    }

    if (!this.isAuthenticated()) {
      return false; // Not disabled, will redirect to login
    }

    if (this.isFreeCourse()) {
      return false; // Enabled for everyone
    }

    if (this.isPaidCourse()) {
      if (this.isPharmacistHolder()) {
        return this.accessStatus !== 'subscribed'; // Disabled if no subscription
      } else {
        return this.accessStatus !== 'subscribed'; // Disabled if not in subscription
      }
    }

    return false;
  }

  getButtonClass(): string {
    let baseClass = 'border-2 w-11/12 rounded-[40px] text-sm text-center px-8 sm:px-12 lg:px-5 xl:px-8 2xl:px-12 py-3 transition duration-300 ease-in-out ';

    if (this.isLoading || this.isCheckingAccess) {
      return baseClass + 'bg-gray-400 border-gray-400 text-white cursor-wait opacity-60';
    }

    if (this.isButtonDisabled() && !this.isLoading) {
      return baseClass + 'bg-gray-400 border-gray-400 text-white cursor-not-allowed opacity-60';
    }

    if (!this.isAuthenticated()) {
      return baseClass + 'bg-blue-500 border-blue-500 text-white hover:bg-transparent hover:text-blue-500 cursor-pointer';
    }

    if (this.isFreeCourse()) {
      return baseClass + 'bg-green-500 border-green-500 text-white hover:bg-transparent hover:text-green-500 cursor-pointer';
    }

    if (this.isPaidCourse()) {
      if (this.isPharmacistHolder()) {
        if (this.accessStatus === 'subscribed') {
          return baseClass + 'bg-fontColor border-fontColor text-secondaryColor hover:bg-transparent hover:text-fontColor cursor-pointer';
        } else {
          return baseClass + 'bg-yellow-500 border-yellow-500 text-white hover:bg-transparent hover:text-yellow-500 cursor-pointer';
        }
      } else {
        if (this.accessStatus === 'subscribed') {
          return baseClass + 'bg-fontColor border-fontColor text-secondaryColor hover:bg-transparent hover:text-fontColor cursor-pointer';
        } else {
          return baseClass + 'bg-gray-400 border-gray-400 text-white cursor-not-allowed opacity-60';
        }
      }
    }

    return baseClass + 'bg-fontColor border-fontColor text-secondaryColor hover:bg-transparent hover:text-fontColor cursor-pointer';
  }

  getAccessMessage(): string {
    if (!this.isAuthenticated()) {
      return 'Veuillez vous connecter pour accéder à cette formation.';
    }

    if (this.isFreeCourse()) {
      return '';
    }

    if (this.isPharmacistHolder()) {
      if (this.accessStatus === 'upgrade_needed') {
        return 'Vous devez souscrire à un abonnement pour accéder aux formations Premium.';
      }
    } else {
      if (this.accessStatus === 'subscribed') {
        return 'Votre pharmacien titulaire a souscrit à un abonnement. Vous avez accès aux formation Premium.';
      } else {
        return 'Seuls les pharmaciens titulaires peuvent souscrire à un abonnement. Votre pharmacie n\'a pas d\'abonnement actif.';
      }
    }
    return '';
  }
}
