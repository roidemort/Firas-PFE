import { Injectable } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';

import { LaboService } from './labo.service';

@Injectable({
  providedIn: 'root',
})
export class LaboChatBadgeService {
  private unreadCountSubject = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCountSubject.asObservable();

  private pollingTimer: ReturnType<typeof setInterval> | null = null;
  private pollingRefCount = 0;
  private activeRequest: Subscription | null = null;

  constructor(private laboService: LaboService) {}

  startPolling() {
    this.pollingRefCount += 1;
    if (this.pollingTimer) {
      return;
    }

    // First refresh is immediate so badge is up to date on page open.
    this.refreshCount();
    this.pollingTimer = setInterval(() => this.refreshCount(), 30000);
  }

  stopPolling() {
    this.pollingRefCount = Math.max(0, this.pollingRefCount - 1);
    if (this.pollingRefCount !== 0) {
      return;
    }

    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
  }

  refreshCount() {
    this.activeRequest?.unsubscribe();
    this.activeRequest = this.laboService.getMyChatUnansweredCount().subscribe({
      next: (res) => {
        if (res?.status) {
          this.unreadCountSubject.next(Number(res.data?.count || 0));
        }
      },
    });
  }

  syncCountFromQuestions(unansweredCount: number) {
    this.unreadCountSubject.next(Math.max(0, Number(unansweredCount || 0)));
  }
}
