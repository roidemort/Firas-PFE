import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface CourseOrCapsuleFilter {
  categoryId?: string;
  providerId?: string;
  categoryName?: string;
  providerName?:string;
  // searchText?: string;
}
@Injectable({
  providedIn: 'root'
})

export class CoursesEventService {

  constructor() { }

  private currentSectionIndex = new BehaviorSubject<number | null>(null);
  currentSectionIndex$ = this.currentSectionIndex.asObservable();

  private indexSectionToggle = new BehaviorSubject<number | null>(null);
  indexSectionToggle$ = this.indexSectionToggle.asObservable();

  private isSidebarExpanded = new BehaviorSubject<boolean | null>(true);
  isSidebarExpanded$ = this.isSidebarExpanded.asObservable();

  private filterSubject = new BehaviorSubject<CourseOrCapsuleFilter | null>(null);
  filterSubject$ = this.filterSubject.asObservable();

  private currentLesson = new BehaviorSubject<any>(null);
  currentLesson$ = this.currentLesson.asObservable();

  private currentQuiz = new BehaviorSubject<any>(null);
  currentQuiz$ = this.currentQuiz.asObservable();


  private defaultLessonId = new BehaviorSubject<string | null>(null);
  defaultLessonId$ = this.defaultLessonId.asObservable();

  setDefaultLessonId(lessonId: string | null) {
    this.defaultLessonId.next(lessonId);
  }

  private enrollCourseSubject = new BehaviorSubject<any>(null);
  enrollCourse$ = this.enrollCourseSubject.asObservable();

  private quizSubject = new BehaviorSubject<boolean>(false);
  quizSubject$ = this.quizSubject.asObservable();

  setEnrollCourse(data: any) {
    this.enrollCourseSubject.next(data);
  }

  getEnrollCourse() {
    return this.enrollCourseSubject.value;
  }

  setSectionIndex(sectionIndex: number | null) {
    this.currentSectionIndex.next(sectionIndex);
  }

  setSectionToggle(sectionIndex: number | null) {
    this.indexSectionToggle.next(sectionIndex);
  }

  setSidebarExpanded(status: boolean | null) {
    this.isSidebarExpanded.next(status);
  }

  setFilter(filter: CourseOrCapsuleFilter) {
    this.filterSubject.next(filter);
  }

  clearFilter() {
    this.filterSubject.next(null);
  }

  setLesson(lesson: any | null) {
    this.currentLesson.next(lesson);
  }

  setQuiz(quiz: any | null) {
    this.currentQuiz.next(quiz);
  }

  setQuizStatus(status: boolean) {
    this.quizSubject.next(status);
  }

}
