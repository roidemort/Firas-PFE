import {Component, OnDestroy, OnInit, signal} from '@angular/core';
import {Router} from '@angular/router';
import { RouterLink } from '@angular/router';
import {NgIf, DatePipe} from '@angular/common';
import {AngularSvgIconModule} from 'angular-svg-icon';
import {toast} from 'ngx-sonner';
import { Subscription } from 'rxjs';
import {LaboService} from '../../../../core/services/labo.service';
import {MarketplaceProduct} from '../../../../core/models/marketplace.model';
import {LoaderComponent} from '../../../../shared/components/loader/loader.component';
import { LaboChatBadgeService } from '../../../../core/services/labo-chat-badge.service';

@Component({
  selector: 'app-labo-products',
  standalone: true,
  imports: [NgIf, AngularSvgIconModule, DatePipe, LoaderComponent, RouterLink],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss',
})
export class LaboProductsComponent implements OnInit, OnDestroy {
  isLoading = false;
  products = signal<MarketplaceProduct[]>([]);
  totalCount = 0;
  currentPage = 1;
  itemsPerPage = 10;
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
    this.loadProducts();
  }

  ngOnDestroy() {
    this.badgeSubscription?.unsubscribe();
    this.laboChatBadgeService.stopPolling();
  }

  loadProducts() {
    this.isLoading = true;
    this.laboService.getMyProducts(this.itemsPerPage, this.currentPage).subscribe({
      next: (res) => {
        this.products.set(res.data.products);
        this.totalCount = res.data.count;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        toast.error('Erreur lors du chargement des produits');
      },
    });
  }

  addProduct() {
    this.router.navigate(['/labo/dashboard/manage-product'], { queryParams: { type: 'add' } });
  }

  editProduct(productId: string) {
    this.router.navigate(['/labo/dashboard/manage-product'], { queryParams: { type: 'edit', productId } });
  }

  get totalPages() { return Math.ceil(this.totalCount / this.itemsPerPage) || 1; }
  changePage(page: number) { if (page >= 1 && page <= this.totalPages) { this.currentPage = page; this.loadProducts(); } }

  goToOrders() { this.router.navigate(['/labo/dashboard/orders']); }
}
