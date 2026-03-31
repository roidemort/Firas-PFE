import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { toast } from 'ngx-sonner';
import { Subscription } from 'rxjs';

import { LaboService } from '../../../../core/services/labo.service';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';
import { LaboChatBadgeService } from '../../../../core/services/labo-chat-badge.service';

@Component({
  selector: 'app-labo-courses',
  standalone: true,
  imports: [NgIf, AngularSvgIconModule, LoaderComponent],
  templateUrl: './courses.component.html',
  styleUrl: './courses.component.scss',
})
export class LaboCoursesComponent implements OnInit, OnDestroy {
  isLoading = false;
  courses = signal<any[]>([]);
  chatUnreadCount = 0;
  private badgeSubscription?: Subscription;

  constructor(
    private laboService: LaboService,
    private router: Router,
    private laboChatBadgeService: LaboChatBadgeService
  ) {}

  ngOnInit() {
    this.badgeSubscription = this.laboChatBadgeService.unreadCount$.subscribe((count) => {
      this.chatUnreadCount = count;
    });
    this.laboChatBadgeService.startPolling();
    this.loadCourses();
  }

  ngOnDestroy() {
    this.badgeSubscription?.unsubscribe();
    this.laboChatBadgeService.stopPolling();
  }

  loadCourses() {
    this.isLoading = true;
    this.laboService.getMyCourses().subscribe({
      next: (res) => {
        if (!res.status) {
          this.courses.set([]);
          this.isLoading = false;
          toast.warning(res.message || 'Impossible de charger les formations');
          return;
        }

        this.courses.set(res.data.courses || []);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        toast.error('Erreur lors du chargement des formations');
      },
    });
  }

  goToCourseDetails(courseId: string) {
    this.router.navigate(['/labo/dashboard/courses', courseId]);
  }

  goToSuggestions(courseId: string) {
    this.router.navigate(['/labo/dashboard/suggestions'], {
      queryParams: { courseId },
    });
  }

  goToProducts() {
    this.router.navigate(['/labo/dashboard/products']);
  }

  goToChat() {
    this.router.navigate(['/labo/dashboard/chat']);
  }
}
