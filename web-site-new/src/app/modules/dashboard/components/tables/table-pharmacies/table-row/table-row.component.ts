import {Component, EventEmitter, Input, Output, ViewChild, ViewContainerRef} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import {DatePipe, NgIf} from "@angular/common";
import {ConfirmDialogComponent} from "../../../dialog/confirm-dialog/confirm-dialog.component";
import {Pharmacy} from "../../../../../../core/models/pharmacy.model";
import {Router, RouterLink} from "@angular/router";

@Component({
  selector: '[app-table-pharmacy-row]',
  standalone: true,
  imports: [FormsModule, AngularSvgIconModule, DatePipe, NgIf, RouterLink],
  templateUrl: './table-row.component.html',
  styleUrl: './table-row.component.scss',
})
export class TableRowComponent {
  @Input() pharmacy: Pharmacy = <Pharmacy>{};
  @ViewChild('actions', { static: true, read: ViewContainerRef })
  actions!: ViewContainerRef;

  @Output() updatePharmacy = new EventEmitter<any>();

  constructor(private router: Router) {}

  onChangeStatus($event: any, pharmacyId: string, status: number) {
    $event.preventDefault();
    const confirmDialogComponent = this.actions.createComponent(ConfirmDialogComponent);
    confirmDialogComponent.instance.itemId = pharmacyId
    confirmDialogComponent.instance.status = status
    confirmDialogComponent.instance.newStatus = $event.target.checked
    confirmDialogComponent.instance.type = 'pharmacy'
    confirmDialogComponent.instance.closeActions.subscribe((res :any) => {
      if(res == 'done') {
        $event.target.checked =!$event.target.checked;  // Revert the status back
      }
      confirmDialogComponent.destroy()
    });
  }
  onEditPharmacy(pharmacyId: string){
    this.updatePharmacy.emit(pharmacyId);
  }
  goToPharmacyDetails(pharmacyId: string) {
    this.router.navigate([`/admin985xilinp/dashboard/details-pharmacy/${pharmacyId}`]);
  }
}
