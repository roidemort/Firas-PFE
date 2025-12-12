import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CoursesEventService } from 'src/app/core/services/courses-event.service';
import { CoursesService } from 'src/app/core/services/courses.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SvgIconComponent } from 'angular-svg-icon';
import { LocalStorageService } from 'src/app/core/services/localstorage.service';
import { LoadingService } from 'src/app/core/services/loading.service';
import { CertificatesService } from 'src/app/core/services/certificates.service';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-learning-sidebar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, SvgIconComponent],
  templateUrl: './learning-sidebar.component.html',
  styleUrls: ['./learning-sidebar.component.scss'],
})
export class LearningSidebarComponent implements OnInit {
  @Input() menu!: boolean;
  @Input() mobileMenu!: boolean;
  @Input() cours!: any;
  @Output() tabSelected = new EventEmitter<string>();

  showContent = true;
  isFeedbackPage = false;
  showModules: { [key: number]: boolean } = {};
  enrollCours: any;

  constructor(private coursesEventService: CoursesEventService, private coursesService: CoursesService, private localStorageService: LocalStorageService, private loadingService: LoadingService, private certificatesService: CertificatesService) {
    this.coursesEventService.isSidebarExpanded$.subscribe(status => {
      if (status != null) {
        this.mobileMenu = !status
        this.menu = status
        this.showSideBarContent();
      }
    })
    this.coursesEventService.indexSectionToggle$.subscribe(index => {
      if (index != null) {
        this.toggleSection(index)
      }
    })

    this.coursesEventService.enrollCourse$.subscribe(cours => {
      if (cours != null) {
        this.enrollCours = cours
        this.sortByPosition(this.enrollCours)
        this.sortQuizzesInSectionsByCreationDate(this.enrollCours.sections)
        // console.log('cours',cours)
      }
    })

    this.coursesEventService.quizSubject$.subscribe(status => {
      if (status) {
        setTimeout(() => {
          // console.log('afetr finish quiz')
          this.getEnrollCourseDetails()
        }, 200);

      }
    })
  }

  ngOnInit(): void {
    this.sortByPosition(this.cours)
    this.sortQuizzesInSectionsByCreationDate(this.cours)
    //console.log('sidebar cours', this.cours)
    this.getEnrollCourseDetails();
    this.mobileMenu = false
    // this.showModules[0] = true;
  }

  showSideBarContent() {
    if (this.menu) {
      setTimeout(() => {
        this.showContent = this.menu
      }, 220);
    } else {
      this.showContent = false
    }
  }

  getEnrollCourseDetails(): void {
    const enrollCourseId = JSON.parse(localStorage.getItem('enrollCourse') || '{}');
    this.coursesService.getDetailsEnrollCourse(enrollCourseId).subscribe({
      next: (result) => {
        if (result.status) {
          this.enrollCours = result.data;
          //const index = this.enrollCours.sections.findIndex((section: { status: number; }) => section.status === 2);
          const index = this.enrollCours.sections.findLastIndex(
            (section: { status: number }) => section.status === 2
          );
          this.closeAll()
          // console.log(index)
          // console.log(this.enrollCours.sections.length)
          if (index >= 0) {
            if (this.enrollCours.sections.length - 1 > index) {
              this.showModules[index + 1] = true;
            } else {
              this.showModules[index] = true;
            }
          } else {
            this.showModules[0] = true;
          }
          //this.showModules[index >= 0 ? index + 1 : 0] = true;
          this.sortByPosition(this.enrollCours)
          this.sortQuizzesInSectionsByCreationDate(this.enrollCours.sections)
          //console.log('sidebar',this.enrollCours)
        }
      },
      error: (err) => console.error(err)
    });
  }

  toggleSection(index: number): void {
    if (this.canAccessSection(index)) {
      this.loadingService.setMobileSidebarExpanded(true)
      this.changeSections(index)
      this.showModules[index] = !this.showModules[index];
      this.closeAll();
      this.showModules[index] = true;
    } else {
      this.changeSections(0)
    }
  }

  changeSections(index: number) {
    this.isFeedbackPage = false;
    this.coursesEventService.setSectionIndex(index)
    this.tabSelected.emit('course');
  }

  selectLesson(lesson: any, lessonId: string, sectionId: string, sectionIndex: number, lessonIndex: number): void {
    if (this.canAccessLesson(sectionIndex, lessonIndex)) {
      this.loadingService.setMobileSidebarExpanded(true)
      this.coursesEventService.setLesson({ lesson, lessonId, sectionId, sectionIndex, lessonIndex });
      this.tabSelected.emit('course');
    }
  }

  goToQuiz(sectionIndex: number): void {
    const section = this.enrollCours.sections[sectionIndex];
    //console.log(section.quiz[this.enrollCours.sections[sectionIndex].quiz.length - 1])
    // console.log(sectionIndex)
    // console.log(this.enrollCours)
    if (this.areAllLessonsComplete(sectionIndex) && section?.quiz?.length) {
      const { passingGrade: passingGrade } = section.quiz[this.enrollCours.sections[sectionIndex].quiz.length - 1].quiz
      const { id: quizEnrollId, quiz: { id: quizId }, status: status } = section.quiz[this.enrollCours.sections[sectionIndex].quiz.length - 1];
      // console.log({ quizEnrollId, quizId })
      this.coursesEventService.setQuiz({ quizEnrollId, quizId, status, passingGrade, lastQuiz: this.enrollCours.sections.length - 1 == sectionIndex , coursId: this.cours.id });
      this.loadingService.setMobileSidebarExpanded(true)
      // window.location.reload();
      this.tabSelected.emit('quiz');
    }
  }

  goToFeedback(): void {
    if (this.areAllSectionsComplete()) {
      this.loadingService.setMobileSidebarExpanded(true)
      this.closeAll()
      this.isFeedbackPage = true;
      this.tabSelected.emit('feedback');
    }
  }

  closeAll() {
    for (let key in this.showModules) {
      this.showModules[key] = false;
    }
  }

  canAccessSection(index: number): boolean {
    return index === 0 || this.enrollCours.sections[index - 1]?.status === 2;
  }

  canAccessLesson(sectionIndex: number, lessonIndex: number): boolean {
    return lessonIndex === 0 || this.isLessonComplete(sectionIndex, lessonIndex - 1);
  }

  isLessonComplete(sectionIndex: number, lessonIndex: number): boolean {
    return this.enrollCours.sections[sectionIndex]?.lessons[lessonIndex]?.status === 2;
  }

  isLessonStarted(sectionIndex: number, lessonIndex: number): boolean {
    return this.enrollCours.sections[sectionIndex]?.lessons[lessonIndex]?.status === 1;
  }

  isQuizStarted(sectionIndex: number) {
    return this.enrollCours?.sections[sectionIndex].quiz[this.enrollCours.sections[sectionIndex].quiz.length - 1].status == 1
  }

  isQuizComlete(sectionIndex: number) {
    return this.enrollCours?.sections[sectionIndex].quiz[this.enrollCours.sections[sectionIndex].quiz.length - 1].status == 2
  }

  // isQuizStarted(sectionIndex: number){
  //   const section = this.enrollCours.sections[sectionIndex]
  //   return section.quiz.some(( quiz: { status: number; }) => quiz?.status === 1);
  //   // return this.enrollCours.sections[sectionIndex].quiz[this.enrollCours.sections[sectionIndex].quiz.length - 1].status == 1
  // }

  // isQuizComlete(sectionIndex: number){
  //   const section = this.enrollCours.sections[sectionIndex]
  //   return section.quiz.some((quiz: { status: number; }) => quiz?.status === 2);
  //   // return this.enrollCours.sections[sectionIndex].quiz[this.enrollCours.sections[sectionIndex].quiz.length - 1].status == 2
  // }
  hasQuizWithStatusTwo(sections: Array<{ quiz: { status: number } }>): boolean {
    return sections.some(section => section.quiz?.status === 1);
  }

  areAllLessonsComplete(sectionIndex: number): boolean {
    return this.enrollCours.sections[sectionIndex]?.lessons.every((lesson: any) => lesson.status === 2);
  }

  areAllSectionsComplete(): boolean {
    return this.enrollCours.sections.every((section: any) => section.status === 2);
  }

  lessonStatusClass(sectionIndex: number, lessonIndex: number): string {
    const lessons = this.enrollCours.sections[sectionIndex]?.lessons;
    if (!lessons) return '';

    const isFirstLesson = lessonIndex === 0;
    const firstLessonStatusIsTwo = lessons[0]?.status === 2;
    if (isFirstLesson || firstLessonStatusIsTwo) {
      return 'text-[#23BAC4] border-[#23BAC4]';
    }
    return 'text-[#81ced3] border-[#81ced3]';
  }

  sortByPosition(course: any) {
    course.sections.sort((a: { position: number }, b: { position: number }) => a.position - b.position);
    course.sections.forEach((section: { lessons: { position: number }[] }) => {
      section.lessons.sort((a, b) => a.position - b.position);
    });
  }

  sortQuizzesInSectionsByCreationDate(sections: any[]): any[] {
    if (!Array.isArray(sections)) {
      return [];
    }
    return sections?.map(section => ({
      ...section,
      quiz: section.quiz.sort((a: { createdAt: string | number | Date; }, b: { createdAt: string | number | Date; }) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
    }));
  }

  getCertifcate() {
    this.certificatesService.getMyCertificate(this.cours.id).subscribe({
      next: (result) => {
        if (result.status) {
          const certificateUrl = `${environment.url}${result.data.link}`;
          // console.log('Certificate URL:', certificateUrl);
          window.open(certificateUrl, '_blank');
        }
      },
      error: (err) => console.error(err)
    });
  }

}

