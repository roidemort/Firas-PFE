import {Component, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {SortConfig} from "../../../../../core/models/config.model";
import {Subscription} from "../../../../../core/models/subscription.model";
import {ActivatedRoute, Router} from "@angular/router";
import {ToastrService} from "ngx-toastr";
import {SubscriptionsService} from "../../../../../core/services/subscription.service";
import {toast} from "ngx-sonner";
import {DatePipe, NgClass, NgIf} from "@angular/common";
import {LoaderComponent} from "../../../../../shared/components/loader/loader.component";
import {SvgIconComponent} from "angular-svg-icon";
import {TableRowComponent} from "../../../components/tables/table-users/table-row/table-row.component";
import {TableHeaderComponent} from "../../../components/tables/table-users/table-header/table-header.component";

@Component({
  selector: 'app-details-subscription',
  standalone: true,
  imports: [
    DatePipe,
    LoaderComponent,
    NgIf,
    SvgIconComponent,
    TableHeaderComponent,
    TableRowComponent,
    NgClass,
    TableRowComponent,
    TableHeaderComponent
  ],
  templateUrl: './details-subscription.component.html',
  styleUrl: './details-subscription.component.scss'
})
export class DetailsSubscriptionComponent implements OnInit{
  @ViewChild('actions', { static: true, read: ViewContainerRef })
  actions!: ViewContainerRef;
  subscriptionId?: string | null;
  isLoading = false
  subscriptionDetails!: Subscription
  sortConfig = {} as SortConfig;
  constructor(private route: ActivatedRoute, private subscriptionsService: SubscriptionsService, private toastr: ToastrService, private router: Router){

  }

  ngOnInit(): void {
    this.subscriptionId = this.route.snapshot.paramMap.get('id');
    this.getSubscriptionDetails()
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
  getSubscriptionDetails() {
    this.isLoading = true
    this.subscriptionsService.getSubscriptionDetails(this.subscriptionId!).subscribe({
      next: (result) => {
        if (result.status) {
          this.isLoading = false
          this.subscriptionDetails = result.data
        } else {
          this.isLoading = false;
          this.toastr.warning('Vérifier vos données', 'Vérification', {
            timeOut: 1500
          })
        }
      },
      error: (error) => this.handleRequestError(error),
    });
  }
}
