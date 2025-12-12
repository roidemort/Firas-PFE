import {Component, EventEmitter, Input, Output, ViewChild, ViewContainerRef} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import {AsyncPipe, DatePipe, NgClass, NgIf} from "@angular/common";
import {ConfirmDialogComponent} from "../../../dialog/confirm-dialog/confirm-dialog.component";
import {Key} from "../../../../../../core/models/pharmacy.model";
import {Router, RouterLink} from "@angular/router";
import {ClipboardModule, ClipboardService} from "ngx-clipboard";
import {SortableComponent} from "../../../sortable/sortable.component";

@Component({
  selector: '[app-table-pharmacy-user-row]',
  standalone: true,
  imports: [ClipboardModule, FormsModule, AngularSvgIconModule, DatePipe, NgIf, RouterLink, NgClass, AsyncPipe, SortableComponent],
  templateUrl: './table-row.component.html',
  styleUrl: './table-row.component.scss',
})
export class TableRowComponent {
  @Input() key: Key = <Key>{};
  @ViewChild('actions', { static: true, read: ViewContainerRef })
  actions!: ViewContainerRef;
  copied = false
  constructor(private router: Router, private _clipboardService: ClipboardService) {}

  onChangeStatus($event: any, pharmacyId: string, status: number) {
    $event.preventDefault();
    const confirmDialogComponent = this.actions.createComponent(ConfirmDialogComponent);
    confirmDialogComponent.instance.itemId = pharmacyId
    confirmDialogComponent.instance.status = status
    confirmDialogComponent.instance.newStatus = $event.target.checked
    confirmDialogComponent.instance.type = 'userPharmacy'
    confirmDialogComponent.instance.closeActions.subscribe((res :any) => {
      if(res == 'done') {
        $event.target.checked =!$event.target.checked;  // Revert the status back
      }
      confirmDialogComponent.destroy()
    });
  }
  async copyToClipboard(key: string) {
    this._clipboardService.copy(key)
    this.copied = true
    await this.delay(1000);
    this.copied = false
  }

  goToUserDetails(userId: string | undefined) {
    this.router.navigate([`/admin985xilinp/dashboard/details-user/${userId}`]);
  }
  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }
}
