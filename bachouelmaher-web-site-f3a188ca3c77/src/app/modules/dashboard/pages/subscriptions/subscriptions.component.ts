import {Component, OnInit, signal, ViewChild, ViewContainerRef} from '@angular/core';
import {Subscription} from "../../../../core/models/subscription.model";
import {SortConfig} from "../../../../core/models/config.model";
import {Router} from "@angular/router";
import {toast} from "ngx-sonner";
import {SubscriptionsService} from "../../../../core/services/subscription.service";
import {LoaderComponent} from "../../../../shared/components/loader/loader.component";
import {NgIf} from "@angular/common";
import {SvgIconComponent} from "angular-svg-icon";
import {TableActionComponent} from "../../components/tables/table-subscription/table-action/table-action.component";
import {TableHeaderComponent} from "../../components/tables/table-subscription/table-header/table-header.component";
import {TableRowComponent} from "../../components/tables/table-subscription/table-row/table-row.component";
import {TableFooterComponent} from "../../components/tables/table-subscription/table-footer/table-footer.component";

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [
    LoaderComponent,
    NgIf,
    SvgIconComponent,
    TableActionComponent,
    TableFooterComponent,
    TableHeaderComponent,
    TableRowComponent,
    TableActionComponent,
    TableHeaderComponent,
    TableRowComponent,
    TableFooterComponent
  ],
  templateUrl: './subscriptions.component.html',
  styleUrl: './subscriptions.component.scss'
})
export class SubscriptionsComponent implements OnInit {
  @ViewChild('actions', { static: true, read: ViewContainerRef })
  actions!: ViewContainerRef;
  isLoading = false;
  subscriptions = signal<Subscription[]>([]);
  allSubscriptionsCount : number = 0
  selectedStatus: string = ""
  selectedDate: string = ""
  selectedPackage: string = ""
  searchText: string = ""
  itemsPerPage: number = 10;
  currentPage: number = 1;
  sortConfig = {} as SortConfig;

  constructor(private subscriptionsService: SubscriptionsService, private router: Router) {
    this.getSubscriptions()
  }

  onChangeStatus(value: string){
    this.selectedStatus = value
    this.currentPage = 1
    this.getSubscriptions()
  }
  onChangeDate(value: string){
    this.selectedDate = value
    this.currentPage = 1
    this.getSubscriptions()
  }
  onChangePackage(value: string){
    this.selectedPackage = value
    this.currentPage = 1
    this.getSubscriptions()
  }

  onChangeItemsPerPage(value: number){
    this.itemsPerPage = value
    this.currentPage = 1
    this.getSubscriptions()
  }
  onPageChange(page: number): void {
    this.currentPage = page;
    this.getSubscriptions()
  }
  public sortSubscriptions(sortConfig: any) {
    this.sortConfig = sortConfig
    this.getSubscriptions()
  }

  private handleRequestError(error: any) {
    const msg = 'An error occurred while fetching users';
    this.isLoading = false
    toast.error(msg, {
      position: 'bottom-right',
      description: error.message,
      action: {
        label: 'Undo',
        onClick: () => console.log('Action!'),
      },
      actionButtonStyle: 'background-color:#DC2626; color:white;',
    });
  }

  ngOnInit() {}

  getSubscriptions() {
    this.isLoading = true
    this.subscriptionsService.getAllSubscriptions(this.sortConfig, this.itemsPerPage, this.currentPage ,this.searchText, this.selectedStatus, this.selectedDate, this.selectedPackage).subscribe({
      next: (result) => {
        this.subscriptions.set(result.data.subscriptions)
        this.allSubscriptionsCount = result.data.count
        this.isLoading = false
      },
      error: (error) => this.handleRequestError(error),
    });
  }
  manageSubscription(type: string, subscriptionId?: string) {
    this.router.navigate([`/admin985xilinp/dashboard/subscriptions/manage-subscription`], { queryParams: { type: type, subscriptionId: subscriptionId },queryParamsHandling: 'merge'  });
  }
}
