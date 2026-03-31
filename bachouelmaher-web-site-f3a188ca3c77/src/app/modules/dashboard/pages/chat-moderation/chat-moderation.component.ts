import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { toast } from 'ngx-sonner';

import { LoaderComponent } from '../../../../shared/components/loader/loader.component';
import { UsersService } from '../../../../core/services/users.service';
import { LabosService } from '../../../../core/services/labos.service';
import { CoursesService } from '../../../../core/services/courses.service';
import { SortConfig } from '../../../../core/models/config.model';

@Component({
  selector: 'app-chat-moderation',
  standalone: true,
  imports: [NgIf, FormsModule, LoaderComponent],
  templateUrl: './chat-moderation.component.html',
  styleUrl: './chat-moderation.component.scss',
})
export class ChatModerationComponent implements OnInit {
  isLoading = false;
  replies = signal<any[]>([]);
  count = 0;

  statuses = ['ACTIVE', 'HIDDEN', 'DELETED', 'ALL'];
  selectedStatus = 'ACTIVE';
  selectedLaboId = '';
  selectedCourseId = '';
  searchText = '';

  labos = signal<any[]>([]);
  courses = signal<any[]>([]);

  private sortConfig = {} as SortConfig;

  constructor(
    private usersService: UsersService,
    private labosService: LabosService,
    private coursesService: CoursesService
  ) {}

  ngOnInit() {
    this.loadFilters();
    this.loadReplies();
  }

  loadFilters() {
    this.labosService.getAllLabos(this.sortConfig, 100, 1).subscribe({
      next: (res) => {
        this.labos.set(res.data.labos || []);
      },
      error: () => {
        this.labos.set([]);
      },
    });

    this.coursesService.getAllCourses(this.sortConfig, 100, 1).subscribe({
      next: (res) => {
        this.courses.set(res.data.courses || []);
      },
      error: () => {
        this.courses.set([]);
      },
    });
  }

  loadReplies() {
    this.isLoading = true;

    this.usersService
      .getChatRepliesModeration(
        this.selectedStatus,
        this.selectedLaboId || undefined,
        this.selectedCourseId || undefined,
        this.searchText || undefined,
        100,
        1
      )
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          if (!res.status) {
            this.replies.set([]);
            this.count = 0;
            toast.warning(res.message || 'Impossible de charger les reponses');
            return;
          }

          this.replies.set(res.data.replies || []);
          this.count = Number(res.data.count || 0);
        },
        error: () => {
          this.isLoading = false;
          this.replies.set([]);
          this.count = 0;
          toast.error('Erreur lors du chargement de la moderation chat');
        },
      });
  }

  applyAction(reply: any, action: 'hide' | 'delete' | 'restore') {
    const confirmed = window.confirm('Confirmer cette action de moderation ?');
    if (!confirmed) {
      return;
    }

    const request$ =
      action === 'hide'
        ? this.usersService.hideChatReply(reply.id)
        : action === 'delete'
          ? this.usersService.deleteChatReply(reply.id)
          : this.usersService.restoreChatReply(reply.id);

    request$.subscribe({
      next: (res) => {
        if (!res.status) {
          toast.warning(res.message || 'Action non appliquee');
          return;
        }

        toast.success('Action appliquee');
        this.loadReplies();
      },
      error: () => {
        toast.error('Erreur lors de la moderation');
      },
    });
  }
}
