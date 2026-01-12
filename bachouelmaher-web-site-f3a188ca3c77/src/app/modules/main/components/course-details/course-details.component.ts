import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
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


  constructor(private route: ActivatedRoute, private coursesService: CoursesService, private coursesEventService: CoursesEventService) {
  }

  ngOnInit(): void {
    this.isLoading = true
    this.coursId = this.route.snapshot.paramMap.get('id');
    this.isTextVisible = new Array(this.cours?.faqs.length).fill(false);
    // console.log(this.coursId)

    this.coursesService.getAllActiveCourses(3).subscribe({
      next: (result) => {
        if (result.status) {
          this.courses = result.data.courses
        }
        // console.log(this.courses)
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
          // this.details = sectionWithPositionZero?.lessons[0]?.details;
          // console.log(this.details)
          this.status = true
        } else {
          this.showMessage = true
          // this.showAlert('handleErrorResponse');
        }
        // console.log(this.cours)
      },
      error: (error) => {
        console.error(error)
      }
    });

    setTimeout(() => {
      this.isLoading = false
    }, 2000);
  }

  showAlert(alertType: 'handleResponse' | 'handleError' | 'handleErrorResponse') {
    const messages: { [key: string]: string } = {
      // handleResponse: 'Membres récupéré avec succès.',
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
    // console.log("onPlayerReady")

    this.api.getDefaultMedia().subscriptions.loadedMetadata.subscribe(this.autoplay.bind(this));

  }

  autoplay() {
    // console.log("play")
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
    //this.showAlert('handleErrorResponse');
    this.isPopupVisible = true;
  }

  closePopup() {
    this.isPopupVisible = false;
  }

}