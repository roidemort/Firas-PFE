import {Component, OnDestroy, OnInit, signal} from '@angular/core';
import {Router} from '@angular/router';
import {NgIf, DatePipe, NgClass} from '@angular/common';
import {AngularSvgIconModule} from 'angular-svg-icon';
import {toast} from 'ngx-sonner';
import { Subscription } from 'rxjs';
import {LaboService} from '../../../../core/services/labo.service';
import {MarketplaceOrder} from '../../../../core/models/marketplace.model';
import {LoaderComponent} from '../../../../shared/components/loader/loader.component';
import { LaboChatBadgeService } from '../../../../core/services/labo-chat-badge.service';

const ORDER_STATUS: {[key: number]: string} = {
  0: 'En attente',
  1: 'Confirmée',
  2: 'Expédiée',
  3: 'Livrée',
  4: 'Annulée',
};

@Component({
  selector: 'app-labo-orders',
  standalone: true,
  imports: [NgIf, NgClass, AngularSvgIconModule, DatePipe, LoaderComponent],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss',
})
export class LaboOrdersComponent implements OnInit, OnDestroy {
  isLoading = false;
  orders = signal<MarketplaceOrder[]>([]);
  totalCount = 0;
  currentPage = 1;
  itemsPerPage = 10;
  orderStatuses = ORDER_STATUS;
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
    this.loadOrders();
  }

  ngOnDestroy() {
    this.badgeSubscription?.unsubscribe();
    this.laboChatBadgeService.stopPolling();
  }

  loadOrders() {
    this.isLoading = true;
    this.laboService.getMyOrders(this.itemsPerPage, this.currentPage).subscribe({
      next: (res) => {
        this.orders.set(res.data.orders);
        this.totalCount = res.data.count;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; toast.error('Erreur de chargement'); },
    });
  }

  updateStatus(orderId: string, status: number) {
    this.laboService.updateOrderStatus(orderId, status).subscribe({
      next: (res) => {
        if (res.status) {
          toast.success('Statut mis à jour');
          this.loadOrders();
        }
      },
    });
  }

  getStatusLabel(status: number) { return ORDER_STATUS[status] || 'Inconnu'; }

  get totalPages() { return Math.ceil(this.totalCount / this.itemsPerPage) || 1; }
  changePage(page: number) { if (page >= 1 && page <= this.totalPages) { this.currentPage = page; this.loadOrders(); } }

  goToProducts() { this.router.navigate(['/labo/dashboard/products']); }
  goToCourses() { this.router.navigate(['/labo/dashboard/courses']); }
  goToSuggestions() { this.router.navigate(['/labo/dashboard/suggestions']); }
  goToChat() { this.router.navigate(['/labo/dashboard/chat']); }
}
