import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CoursesEventService } from 'src/app/core/services/courses-event.service';
import { CoursesService } from 'src/app/core/services/courses.service';
import { Course } from 'src/app/core/models/course.entity';
import { CommonModule } from '@angular/common';
import { ChatSidebarComponent } from '../chat-sidebar/chat-sidebar.component';
import { VimeoPlayerComponent } from '../vimeo-player/vimeo-player.component';
import { MainLoaderComponent } from '../loader/loader.component';
import { LoadingService } from 'src/app/core/services/loading.service';
import { FileOverviewComponent } from "../file-overview/file-overview.component";

@Component({
  selector: 'app-learning-course',
  standalone: true,
  imports: [ChatSidebarComponent, CommonModule, VimeoPlayerComponent, MainLoaderComponent, FileOverviewComponent],
  templateUrl: './learning-course.component.html',
  styleUrls: ['./learning-course.component.scss']
})
export class LearningCourseComponent implements OnInit, OnDestroy {
  @Input() cours!: Course;
  isChatOpen = false;
  isLoading = false;
  endOfCourses = false;
  currentChapterIndex = 0;
  access = false;
  currentLesson: any;
  enrollCourseId: string;
  enrollCours: any;
  key: any;
  clicked = false
  private subscriptions = new Subscription();

  constructor(
    private coursesEventService: CoursesEventService,
    private coursesService: CoursesService,
    private loadingService: LoadingService
  ) {
    this.enrollCourseId = JSON.parse(localStorage.getItem('enrollCourse') || '{}');
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.getEnrollCourseDetails();

    // this.currentLesson = null
    // this.currentChapterIndex = 0


    this.subscriptions.add(
      this.coursesEventService.currentSectionIndex$.subscribe((index) => {
        if (index != null) {
          this.currentLesson = null;
          this.currentChapterIndex = index;
          this.updateCourseStatus();
          this.coursesEventService.setSectionIndex(null)
        }
      })
    );

    this.subscriptions.add(
      this.coursesEventService.currentLesson$.subscribe((lesson) => {
        if (lesson != null) {
          this.currentLesson = lesson;
          if(this.currentLesson?.lesson?.lesson?.type == 'pdf'){
            this.markAsStarted()
          }
          // console.log(lesson)
          this.key = null;
          setTimeout(() => {
            this.key = true;
          }, 10);
          this.coursesEventService.setLesson(null)
        }
      })
    );

    //setTimeout(() => {
    this.isLoading = false;
    //}, 1000);
  }

  ngOnDestroy(): void {
    //this.sortByPosition(this.cours)
    this.subscriptions.unsubscribe();
  }

  getEnrollCourseDetails(): void {
    this.coursesService.getDetailsEnrollCourse(this.enrollCourseId).subscribe({
      next: (result) => {
        if (result.status) {
          this.enrollCours = result.data;
          const index = this.enrollCours.sections.findIndex((section: { status: number; }) => section.status === 2);
          this.currentChapterIndex = index + 1;
          //console.log('course', this.enrollCours)
          this.coursesEventService.setEnrollCourse(this.enrollCours)
          this.updateCourseStatus();
        }
      },
      error: (error) => console.error(error),
    });
  }

  updateCourseStatus(): void {
    // const section = this.enrollCours.sections[this.currentChapterIndex];
    const section = this.enrollCours?.sections?.[this.currentChapterIndex]
      ? this.enrollCours.sections[this.currentChapterIndex]
      : this.enrollCours?.sections?.[this.currentChapterIndex - 1];
    this.access = section?.status === 2;
    this.endOfCourses = this.currentChapterIndex === this.enrollCours?.sections?.length - 1;
  }

  handleVideoEvent(event: string): void {
    //console.log(this.currentLesson)
    if (this.currentLesson) {
      const section = this.enrollCours?.sections?.[this.currentLesson.sectionIndex];
      const lesson = section?.lessons?.[this.currentLesson.lessonIndex];
      const data: any = {
        sectionId: this.currentLesson.sectionId,
        lessonId: this.currentLesson.lessonId,
      };
      if (lesson?.status == 0 && !lesson.pause && !lesson.endedAt) {
        if (event === 'startedAt') {
          data.startedAt = true;
        }
      } else if (event.startsWith('pause:')) {
        data.pause = event.split(': ')[1];
      } else if (event === 'endedAt') {
        data.endedAt = true;
      }

      this.updateCourseData(data);
    }
  }

  markAsFinished() {
    if (this.currentLesson) {
      const data: any = {
        sectionId: this.currentLesson.sectionId,
        lessonId: this.currentLesson.lessonId,
        endedAt: true
      };
      this.clicked = true
      this.updateCourseData(data);
    }
  }

  markAsStarted() {
    if (this.currentLesson) {
      const data: any = {
        sectionId: this.currentLesson.sectionId,
        lessonId: this.currentLesson.lessonId,
        startedAt: true
      };
      this.updateCourseData(data);
    }
  }

  updateCourseData(data: any): void {
    this.coursesService.updateEnrollCourse(this.enrollCourseId, data).subscribe({
      next: (result) => {
        if (result.status) {
          // console.log(result)
          this.getEnrollCourseDetails();
        }
      },
      error: (error) => console.error(error),
    });
  }

  toggleChat(): void {
    this.isChatOpen = !this.isChatOpen;
    if (this.isChatOpen) {
      this.loadingService.setChat(true)
    }
  }

  goToNextChapter(): void {
    if (this.enrollCours.sections[this.currentChapterIndex].status === 2 && this.currentChapterIndex < this.enrollCours.sections.length - 1) {
      this.currentChapterIndex++;
      this.coursesEventService.setSectionToggle(this.currentChapterIndex);
      this.endOfCourses = this.currentChapterIndex === this.enrollCours.sections.length - 1;
    }
  }

  getTextFromHtml(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }


}
