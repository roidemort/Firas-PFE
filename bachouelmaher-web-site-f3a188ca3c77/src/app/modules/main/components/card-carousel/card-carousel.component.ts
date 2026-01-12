import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { forkJoin, map } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { CoursesService } from 'src/app/core/services/courses.service';
import { UsersService } from 'src/app/core/services/users.service';
import { MainLoaderComponent } from '../loader/loader.component';
import { AlertComponent } from '../alert/alert.component'; // Import the alert component

@Component({
  selector: 'app-card-carousel',
  standalone: true,
  imports: [CommonModule, RouterModule, MainLoaderComponent, AlertComponent], // Add AlertComponent
  templateUrl: './card-carousel.component.html',
  styleUrls: ['./card-carousel.component.scss']
})
export class CardCarouselComponent {
  @Input() cards: any[] = [];
  @Input() style: boolean = true;
  @Input() inProgress: boolean = false;
  currentIndex = 0;
  currentIndexEnrolls = 0;
  cardsToShow = 3;
  isHoveringPrev = false;
  isHoveringNext = false;
  coursesWithDetails: any[] = [];
  courseProgressions: { [key: string]: any } = {};
  user: any;
  courses: any;
  prevStatus = true;
  nextStatus = true;
  prevStatusEnrolls = true;
  nextStatusEnrolls = true;
  isLoading = false;

  // Alert properties
  showAlert = false;
  alertMessage = '';
  alertType: 'error' | 'warning' | 'success' = 'warning';

  constructor(
    private router: Router,
    private userService: UsersService,
    private authService: AuthService,
    private coursService: CoursesService
  ) {}

  ngOnInit() {
    this.isLoading = true;
    this.user = this.authService.getUser();
    if (this.inProgress) {
      this.getUserDetails(this.user.id);
    } else {
      this.isLoading = false;
    }
  }

  extractCourseDataById(courseId: string): void {
    const card = this.cards.find(card => card.id === courseId);
    if (card) {
      const courseIndex = this.courses.findIndex((course: { course: { id: string; }; }) => course.course.id === courseId);
      if (courseIndex !== -1) {
        this.courses[courseIndex] = {
          ...this.courses[courseIndex],
          category: card.category,
          provider: card.provider,
          preview: card.preview
        };
      }
    }
  }

  getUserDetails(id: string) {
    this.userService.getMyTeamDetails(id).subscribe({
      next: (res) => {
        if (res.status) {
          this.user = res.data.users;
          this.courses = res.data.users.enrolls;
          if (this.inProgress) {
            this.courses.forEach((course: { course: { id: string; }; }) => {
              this.extractCourseDataById(course.course.id);
            });
          }
          this.sortCoursesByStartedAt(this.courses);
          this.getCoursProgrssion(this.courses);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  sortCoursesByStartedAt(courses: any) {
    courses.sort((a: any, b: any) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  }

  getCoursProgrssion(courses: any) {
    courses.forEach((course: any) => {
      this.getProgression(course.id);
    });
    this.isLoading = false;
  }

  getProgression(coursId: string) {
    const data = {
      courseId: coursId,
      userId: this.user.id
    };
    this.userService.getProgression(data).subscribe({
      next: (res) => {
        if (res.status) {
          this.courseProgressions[coursId] = res.data.course;
        }
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  prevCard() {
    this.prevStatus = false;
    this.nextStatus = false;
    if (this.currentIndex > 0) {
      this.currentIndex--;
      setTimeout(() => {
        this.nextStatus = true;
        this.prevStatus = true;
      }, 250);
    }
  }

  nextCard() {
    this.nextStatus = false;
    this.prevStatus = false;
    if (this.currentIndex < this.cards.length - this.cardsToShow) {
      this.currentIndex++;
      setTimeout(() => {
        this.prevStatus = true;
        this.nextStatus = true;
      }, 250);
    }
  }

  prevEnroll() {
    this.prevStatusEnrolls = false;
    this.nextStatusEnrolls = false;
    if (this.currentIndexEnrolls > 0) {
      this.currentIndexEnrolls--;
      setTimeout(() => {
        this.nextStatusEnrolls = true;
        this.prevStatusEnrolls = true;
      }, 250);
    }
  }

  nextEnroll() {
    this.nextStatusEnrolls = false;
    this.prevStatusEnrolls = false;
    if (this.currentIndexEnrolls < this.user.enrolls.length - this.cardsToShow) {
      this.currentIndexEnrolls++;
      setTimeout(() => {
        this.prevStatusEnrolls = true;
        this.nextStatusEnrolls = true;
      }, 250);
    }
  }

  goToCourse(card: any) {
    // Check if the course is coming soon
    if (card.comingSoon) {
      this.showComingSoonAlert(card);
      return;
    }

    // Also check the status field if needed
    /*if (card.status !== 1) { // Assuming 1 means active
      this.showAlertMessage('Ce cours n\'est pas encore disponible.', 'warning');
      return;
    }*/

    const route = `notre-plateforme/details-cours/${card.id}`;
    const navigationPromise = this.router.navigate([route]);

    if (!this.style) {
      navigationPromise.then(() => window.location.reload());
    }
  }

  // Check if a course is clickable
  isCourseClickable(card: any): boolean {
    return !card.comingSoon && card.status === 1;
  }

  // Get coming soon message
  getComingSoonMessage(card: any): string {
    return card.messageComingSoon || 'Bientôt disponible';
  }

  // Show coming soon alert
  showComingSoonAlert(card: any) {
    const message = card.messageComingSoon
      ? card.messageComingSoon
      : `"${card.title}" sera disponible prochainement.`;

    this.showAlertMessage(message, 'warning');
  }

  // Show alert message
  showAlertMessage(message: string, type: 'error' | 'warning' | 'success' = 'warning') {
    this.alertMessage = message;
    this.alertType = type;
    this.showAlert = true;

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      this.closeAlert();
    }, 5000);
  }

  // Close alert
  closeAlert() {
    this.showAlert = false;
    this.alertMessage = '';
  }

  // Format duration
  formatDuration(duration?: string): string {
    if (!duration) return '00h 00 minutes';

    const [hours, minutes] = duration.split(':').map(Number);

    if (hours === 0) {
      return `${minutes} minutes`;
    }
    return `${hours}h ${minutes} minutes`;
  }

  // Get rounded score
  getRoundedScore(score: number): number {
    return Math.floor(score);
  }
}
