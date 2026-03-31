import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { toast } from 'ngx-sonner';
import { Subscription } from 'rxjs';

import { LaboService } from '../../../../core/services/labo.service';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';
import { LaboChatBadgeService } from '../../../../core/services/labo-chat-badge.service';

@Component({
  selector: 'app-labo-suggestions',
  standalone: true,
  imports: [NgIf, FormsModule, LoaderComponent],
  templateUrl: './suggestions.component.html',
  styleUrl: './suggestions.component.scss',
})
export class LaboSuggestionsComponent implements OnInit, OnDestroy {
  isLoading = false;
  isSubmitting = false;
  isPurposeMenuOpen = false;

  courses = signal<any[]>([]);
  suggestions = signal<any[]>([]);

  selectedCourseId = '';
  editingSuggestionId: string | null = null;
  chatUnreadCount = 0;
  private badgeSubscription?: Subscription;

  form = {
    purposeType: null as 'titre' | 'desc' | 'faq' | null,
    purposeTitle: '',
    purposeDesc: '',
    purposeFaqText: '',
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private laboService: LaboService,
    private laboChatBadgeService: LaboChatBadgeService
  ) {}

  getStatusLabel(status: string) {
    if (status === 'PENDING') return 'En attente';
    if (status === 'IN_REVIEW') return 'En cours de revision';
    if (status === 'ACCEPTED') return 'Acceptee';
    if (status === 'REJECTED') return 'Refusee';
    return status;
  }

  ngOnInit() {
    this.badgeSubscription = this.laboChatBadgeService.unreadCount$.subscribe((count) => {
      this.chatUnreadCount = count;
    });
    this.laboChatBadgeService.startPolling();

    const courseId = this.route.snapshot.queryParamMap.get('courseId');
    if (courseId) this.selectedCourseId = courseId;

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
          this.suggestions.set([]);
          this.isLoading = false;
          toast.warning(res.message || 'Impossible de charger les formations');
          return;
        }

        this.courses.set(res.data.courses || []);

        if (!this.selectedCourseId && this.courses().length) {
          this.selectedCourseId = this.courses()[0].id;
        }

        this.loadSuggestions();
      },
      error: () => {
        this.isLoading = false;
        toast.error('Erreur de chargement des formations');
      },
    });
  }

  loadSuggestions() {
    if (!this.selectedCourseId) {
      this.suggestions.set([]);
      this.isLoading = false;
      return;
    }

    this.laboService.getMySuggestions(this.selectedCourseId).subscribe({
      next: (res) => {
        if (!res.status) {
          this.suggestions.set([]);
          this.isLoading = false;
          toast.warning(res.message || 'Impossible de charger les suggestions');
          return;
        }

        this.suggestions.set(res.data.suggestions || []);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        toast.error('Erreur de chargement des suggestions');
      },
    });
  }

  onCourseChange(courseId: string) {
    this.selectedCourseId = courseId;
    this.editingSuggestionId = null;
    this.isPurposeMenuOpen = false;
    this.resetForm();
    this.loadSuggestions();
  }

  togglePurposeMenu() {
    this.isPurposeMenuOpen = !this.isPurposeMenuOpen;
  }

  selectPurposeType(type: 'titre' | 'desc' | 'faq') {
    this.form.purposeType = type;
    this.isPurposeMenuOpen = false;
  }

  getPurposeLabel() {
    if (!this.form.purposeType) return 'Choisir';
    return this.form.purposeType;
  }

  editSuggestion(suggestion: any) {
    if (suggestion.status !== 'PENDING') {
      toast.warning('Seules les suggestions en attente sont modifiables');
      return;
    }

    this.editingSuggestionId = suggestion.id;
    this.form.purposeTitle = suggestion.proposedTitle || '';
    this.form.purposeDesc = suggestion.proposedDetails || '';
    this.form.purposeFaqText = (suggestion.proposedFaqs || []).map((f: any) => `${f.title}|${f.content}`).join('\n');

    if (this.form.purposeTitle) {
      this.form.purposeType = 'titre';
      return;
    }

    if (this.form.purposeDesc) {
      this.form.purposeType = 'desc';
      return;
    }

    if (this.form.purposeFaqText) {
      this.form.purposeType = 'faq';
      return;
    }

    this.form.purposeType = null;
  }

  submit() {
    if (!this.selectedCourseId) {
      toast.warning('Choisissez une formation');
      return;
    }

    if (!this.form.purposeType) {
      toast.warning('Choisissez un type de purpose');
      return;
    }

    const purposeValue =
      this.form.purposeType === 'titre'
        ? this.form.purposeTitle.trim()
        : this.form.purposeType === 'desc'
          ? this.form.purposeDesc.trim()
          : this.form.purposeType === 'faq'
            ? this.form.purposeFaqText.trim()
            : '';

    if (!purposeValue) {
      toast.warning('Saisissez une valeur pour le purpose selectionne');
      return;
    }

    const faqs = this.form.purposeType === 'faq'
      ? purposeValue
          .split('\n')
          .map((x) => x.trim())
          .filter(Boolean)
          .map((line) => {
            const [title, content] = line.split('|');
            return { title: (title || '').trim(), content: (content || '').trim() };
          })
          .filter((x) => x.title && x.content)
      : [];

    const payload: any = {
      courseId: this.selectedCourseId,
      proposedTitle: this.form.purposeType === 'titre' ? purposeValue : undefined,
      proposedDetails: this.form.purposeType === 'desc' ? purposeValue : undefined,
      proposedFaqs: this.form.purposeType === 'faq' && faqs.length ? faqs : undefined,
    };

    if (this.form.purposeType === 'faq' && !payload.proposedFaqs) {
      toast.warning('Format FAQ invalide. Utilisez: Question|Reponse');
      return;
    }

    this.isSubmitting = true;

    const request$ = this.editingSuggestionId
      ? this.laboService.updateSuggestion(this.editingSuggestionId, payload)
      : this.laboService.createSuggestion(payload);

    request$.subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (res.status) {
          toast.success(this.editingSuggestionId ? 'Suggestion mise a jour' : 'Suggestion envoyee');
          this.editingSuggestionId = null;
          this.resetForm();
          this.loadSuggestions();
        } else {
          toast.warning(res.message || 'Verification requise');
        }
      },
      error: () => {
        this.isSubmitting = false;
        toast.error('Erreur lors de la soumission');
      },
    });
  }

  resetForm() {
    this.form = {
      purposeType: null,
      purposeTitle: '',
      purposeDesc: '',
      purposeFaqText: '',
    };
  }

  goBack() {
    this.router.navigate(['/labo/dashboard/courses']);
  }

  goToChat() {
    this.router.navigate(['/labo/dashboard/chat']);
  }
}
