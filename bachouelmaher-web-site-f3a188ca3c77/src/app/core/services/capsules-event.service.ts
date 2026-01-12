import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface CourseOrCapsuleFilter {
  categoryId?: string;
  categoryName?: string;
  providerId?: string;
  providerName?: string; 
  searchText?: string;
}
@Injectable({
  providedIn: 'root'
})

export class CapsulesEventService {

  constructor() { }

  private filterSubject = new BehaviorSubject<CourseOrCapsuleFilter | null>(null);
  filterSubject$ = this.filterSubject.asObservable();

  setFilter(filter: CourseOrCapsuleFilter) {
    this.filterSubject.next(filter);
  }

  clearFilter() {
    this.filterSubject.next(null);
  }
}
