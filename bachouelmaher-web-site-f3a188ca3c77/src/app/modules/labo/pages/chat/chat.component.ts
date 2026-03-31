import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { DatePipe, NgClass, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { toast } from 'ngx-sonner';
import { Subscription } from 'rxjs';

import { LaboService } from '../../../../core/services/labo.service';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';
import { LaboChatBadgeService } from '../../../../core/services/labo-chat-badge.service';

type ChatTab = 'unanswered' | 'answered' | 'all';
type ReplyVisibility = 'public' | 'private';

@Component({
  selector: 'app-labo-chat',
  standalone: true,
  imports: [NgIf, NgClass, FormsModule, DatePipe, LoaderComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class LaboChatComponent implements OnInit, OnDestroy {
  isLoadingQuestions = false;
  isLoadingDetails = false;
  isSubmittingReply = false;

  tabs: { key: ChatTab; label: string }[] = [
    { key: 'unanswered', label: 'Non repondues' },
    { key: 'answered', label: 'Repondues' },
    { key: 'all', label: 'Toutes' },
  ];

  selectedTab: ChatTab = 'unanswered';
  selectedCourseId = '';

  courses = signal<any[]>([]);
  questions = signal<any[]>([]);
  replies = signal<any[]>([]);
  counts = signal({ unanswered: 0, answered: 0, all: 0 });

  selectedQuestion: any = null;
  replyContent = '';
  replyVisibility: ReplyVisibility = 'private';
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
    this.loadCoursesAndQuestions();
  }

  ngOnDestroy() {
    this.badgeSubscription?.unsubscribe();
    this.laboChatBadgeService.stopPolling();
  }

  loadCoursesAndQuestions() {
    this.laboService.getMyCourses().subscribe({
      next: (res) => {
        if (!res.status) {
          this.courses.set([]);
          this.questions.set([]);
          toast.warning(res.message || 'Impossible de charger les formations');
          return;
        }

        this.courses.set(res.data.courses || []);
        this.loadQuestions();
      },
      error: () => {
        this.courses.set([]);
        this.questions.set([]);
        toast.error('Erreur lors du chargement des formations');
      },
    });
  }

  loadQuestions() {
    this.isLoadingQuestions = true;
    this.selectedQuestion = null;
    this.replies.set([]);

    this.laboService
      .getMyChatQuestions(this.selectedTab, this.selectedCourseId || undefined)
      .subscribe({
        next: (res) => {
          this.isLoadingQuestions = false;
          if (!res.status) {
            this.questions.set([]);
            this.counts.set({ unanswered: 0, answered: 0, all: 0 });
            toast.warning(res.message || 'Impossible de charger les questions');
            return;
          }

          this.questions.set(res.data.questions || []);
          const counts = res.data.counts || { unanswered: 0, answered: 0, all: 0 };
          this.counts.set(counts);
          this.laboChatBadgeService.syncCountFromQuestions(counts.unanswered || 0);
        },
        error: () => {
          this.isLoadingQuestions = false;
          this.questions.set([]);
          toast.error('Erreur lors du chargement des questions');
        },
      });
  }

  selectTab(tab: ChatTab) {
    if (this.selectedTab === tab) {
      return;
    }

    this.selectedTab = tab;
    this.loadQuestions();
  }

  onCourseFilterChange(courseId: string) {
    this.selectedCourseId = courseId;
    this.loadQuestions();
  }

  openQuestion(questionId: string) {
    this.isLoadingDetails = true;
    this.replyContent = '';

    this.laboService.getMyChatQuestionDetails(questionId).subscribe({
      next: (res) => {
        this.isLoadingDetails = false;
        if (!res.status) {
          toast.warning(res.message || 'Impossible de charger le detail');
          return;
        }

        this.selectedQuestion = res.data.question;
        this.replies.set(res.data.replies || []);
      },
      error: () => {
        this.isLoadingDetails = false;
        toast.error('Erreur lors du chargement du detail');
      },
    });
  }

  sendReply() {
    if (!this.selectedQuestion?.id) {
      toast.warning('Selectionnez une question');
      return;
    }

    const normalizedContent = this.replyContent.trim();
    if (!normalizedContent) {
      toast.warning('La reponse est obligatoire');
      return;
    }

    this.isSubmittingReply = true;

    this.laboService
      .replyToMyChatQuestion(this.selectedQuestion.id, normalizedContent, this.replyVisibility)
      .subscribe({
        next: (res) => {
          this.isSubmittingReply = false;
          if (!res.status) {
            toast.warning(res.message || 'Impossible d envoyer la reponse');
            return;
          }

          toast.success('Reponse envoyee');
          this.replyContent = '';
          this.openQuestion(this.selectedQuestion.id);
          this.loadQuestions();
          this.laboChatBadgeService.refreshCount();
        },
        error: () => {
          this.isSubmittingReply = false;
          toast.error('Erreur lors de l envoi');
        },
      });
  }

  goToProducts() {
    this.router.navigate(['/labo/dashboard/products']);
  }

  goToOrders() {
    this.router.navigate(['/labo/dashboard/orders']);
  }

  goToCourses() {
    this.router.navigate(['/labo/dashboard/courses']);
  }

  goToSuggestions() {
    this.router.navigate(['/labo/dashboard/suggestions']);
  }
}
