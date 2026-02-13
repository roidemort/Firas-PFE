import {Component, EventEmitter, Input, Output, ViewChild, ViewContainerRef} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import {DatePipe, NgIf} from "@angular/common";
import {ConfirmDialogComponent} from "../../../dialog/confirm-dialog/confirm-dialog.component";
import {Provider} from "../../../../../../core/models/provider.model";
import {Router, RouterLink} from "@angular/router";

@Component({
  selector: '[app-table-provider-row]',
  standalone: true,
  imports: [FormsModule, AngularSvgIconModule, DatePipe, NgIf, RouterLink],
  templateUrl: './table-row.component.html',
  styleUrl: './table-row.component.scss',
})
export class TableRowComponent {
  @Input() provider: Provider = <Provider>{};
  @ViewChild('actions', { static: true, read: ViewContainerRef })
  actions!: ViewContainerRef;

  @Output() updateProvider = new EventEmitter<any>();

  constructor() {}

  onChangeStatus($event: any, providerId: string, status: number) {
    $event.preventDefault();
    const confirmDialogComponent = this.actions.createComponent(ConfirmDialogComponent);
    confirmDialogComponent.instance.itemId = providerId
    confirmDialogComponent.instance.status = status
    confirmDialogComponent.instance.newStatus = $event.target.checked
    confirmDialogComponent.instance.type = 'provider'
    confirmDialogComponent.instance.closeActions.subscribe((res :any) => {
      if(res == 'done') {
        $event.target.checked =!$event.target.checked;  // Revert the status back
      }
      confirmDialogComponent.destroy()
    });
  }
  onEditProvider(providerId: string){
    this.updateProvider.emit(providerId);
  }
}
