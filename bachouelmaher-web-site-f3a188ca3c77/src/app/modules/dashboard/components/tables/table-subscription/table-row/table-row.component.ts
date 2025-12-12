import {Component, EventEmitter, Input, Output, ViewChild, ViewContainerRef} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import {CurrencyPipe, DatePipe, DecimalPipe, NgIf} from "@angular/common";
import {ConfirmDialogComponent} from "../../../dialog/confirm-dialog/confirm-dialog.component";
import {Provider} from "../../../../../../core/models/provider.model";
import {Router, RouterLink} from "@angular/router";
import {Capsule} from "../../../../../../core/models/capsule.model";
import {Subscription} from "../../../../../../core/models/subscription.model";

@Component({
  selector: '[app-table-subscription-row]',
  standalone: true,
  imports: [FormsModule, AngularSvgIconModule, DatePipe, NgIf, RouterLink, DecimalPipe, CurrencyPipe],
  templateUrl: './table-row.component.html',
  styleUrl: './table-row.component.scss',
})
export class TableRowComponent {
  @Input() subscription: Subscription = <Subscription>{};
  @ViewChild('actions', { static: true, read: ViewContainerRef })
  actions!: ViewContainerRef;

  @Output() updateSubscription = new EventEmitter<any>();

  constructor(private router: Router) {}

  onChangeStatus($event: any, subscriptionId: string, status: number) {
    $event.preventDefault();
    const confirmDialogComponent = this.actions.createComponent(ConfirmDialogComponent);
    confirmDialogComponent.instance.itemId = subscriptionId
    confirmDialogComponent.instance.status = status
    confirmDialogComponent.instance.newStatus = $event.target.checked
    confirmDialogComponent.instance.type = 'subscription'
    confirmDialogComponent.instance.closeActions.subscribe((res :any) => {
      if(res == 'done') {
        $event.target.checked =!$event.target.checked;  // Revert the status back
      }
      confirmDialogComponent.destroy()
    });
  }
  onEditSubscription(capsuleId: string){
    this.updateSubscription.emit(capsuleId);
  }
  goToSubscriptionDetails(subscriptionId: string | undefined) {
    this.router.navigate([`/admin985xilinp/dashboard/details-subscription/${subscriptionId}`]);
  }
  goToUserDetails(userId: string | undefined) {
    this.router.navigate([`/admin985xilinp/dashboard/details-user/${userId}`]);
  }
  getTotalPaymentPrice(subscription: Subscription): number {
    return subscription.usersNumber * Number(subscription.package.price) * Number(subscription.package.duration)
  }
}
