import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { toast } from 'ngx-sonner';
import { RegistrationRequestsService, RegistrationRequest } from '../../../../core/services/registration-requests.service';
import { SortConfig } from '../../../../core/models/config.model';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-registration-requests',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AngularSvgIconModule,
    PaginationComponent,
    LoaderComponent,
  ],
  templateUrl: './registration-requests.component.html',
  styleUrl: './registration-requests.component.scss',
})
export class RegistrationRequestsComponent implements OnInit {
  requests = signal<RegistrationRequest[]>([]);
  allRequestsCount: number = 0;
  itemsPerPage: number = 10;
  currentPage: number = 1;
  sortConfig = {} as SortConfig;
  isLoading = false;

  constructor(private registrationRequestsService: RegistrationRequestsService) {}

  ngOnInit() {
    this.getRequests();
  }

  getRequests() {
    this.isLoading = true;
    this.registrationRequestsService
      .getAllRegistrationRequests(
        this.sortConfig,
        this.itemsPerPage,
        this.currentPage,
        0 // pending status
      )
      .subscribe({
        next: (result) => {
          this.requests.set(result.data.requests);
          this.allRequestsCount = result.data.count;
          this.isLoading = false;
        },
        error: (error) => {
          this.handleRequestError(error);
        },
      });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.getRequests();
  }

  onChangeItemsPerPage(value: number) {
    this.itemsPerPage = value;
    this.currentPage = 1;
    this.getRequests();
  }

  approveRequest(requestId: string) {
    if (!confirm('Êtes-vous sûr de vouloir approuver cette demande ?')) {
      return;
    }

    this.isLoading = true;
    this.registrationRequestsService.approveRegistrationRequest(requestId).subscribe({
      next: (result) => {
        if (result.status) {
          toast.success('Demande approuvée avec succès', {
            description: 'La clé d\'activation a été envoyée par email.',
          });
          this.getRequests();
        } else {
          toast.error('Erreur', {
            description: result.message || 'Impossible d\'approuver la demande',
          });
          this.isLoading = false;
        }
      },
      error: (error) => {
        this.handleRequestError(error);
      },
    });
  }

  rejectRequest(requestId: string) {
    if (!confirm('Êtes-vous sûr de vouloir rejeter cette demande ?')) {
      return;
    }

    this.isLoading = true;
    this.registrationRequestsService.rejectRegistrationRequest(requestId).subscribe({
      next: (result) => {
        if (result.status) {
          toast.success('Demande rejetée avec succès', {
            description: 'Un email de notification a été envoyé.',
          });
          this.getRequests();
        } else {
          toast.error('Erreur', {
            description: result.message || 'Impossible de rejeter la demande',
          });
          this.isLoading = false;
        }
      },
      error: (error) => {
        this.handleRequestError(error);
      },
    });
  }

  private handleRequestError(error: any) {
    this.isLoading = false;
    toast.error('Une erreur s\'est produite', {
      description: error.message || 'Impossible de charger les demandes',
    });
  }

  getTotalStaff(request: RegistrationRequest): number {
    return request.nbPharmacien + request.nbPreparatoire;
  }
}

