import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.loadingSubject.asObservable();

  private loggedSubject = new BehaviorSubject<boolean>(false);
  isLogged$ = this.loggedSubject.asObservable();

  private loggedDashboardSubject = new BehaviorSubject<boolean>(false);
  isDasboardLogged$ = this.loggedDashboardSubject.asObservable();

  private tabSelected = new BehaviorSubject<string>('');
  tabSelected$ = this.tabSelected.asObservable();

  private courseIdSubject = new BehaviorSubject<string | null>(null);
  courseId$ = this.courseIdSubject.asObservable();

  private isMobileSidebarExpandedSubject = new BehaviorSubject<boolean>(false);
  isMobileSidebarExpanded$ = this.isMobileSidebarExpandedSubject.asObservable();

  private chatSubject = new BehaviorSubject<boolean>(false);
  chatSubject$ = this.chatSubject.asObservable();

  private mobileMenuSubject = new BehaviorSubject<boolean>(false);
  mobileMenuSubject$ = this.mobileMenuSubject.asObservable();

  private menuSubject = new BehaviorSubject<string>('');
  menuSubject$ = this.menuSubject.asObservable();

  setLoadingState(isLoading: boolean) {
    this.loadingSubject.next(isLoading);
  }

  setloggedState(isLogged: boolean) {
    this.loggedSubject.next(isLogged);
  }

  setDashboardloggedState(isLogged: boolean) {
    this.loggedDashboardSubject.next(isLogged);
  }

  setTab(tab: string) {
    this.tabSelected.next(tab);
  }

  setMenu(menu: string) {
    this.menuSubject.next(menu);
  }

  setCourseId(courseId: string | null) {
    this.courseIdSubject.next(courseId);
  }

  setMobileSidebarExpanded(status: boolean) {
    this.isMobileSidebarExpandedSubject.next(status);
  }

  setChat(status: boolean) {
    this.chatSubject.next(status);
  }

  setMobileMenu(status: boolean) {
    this.mobileMenuSubject.next(status);
  }

}
