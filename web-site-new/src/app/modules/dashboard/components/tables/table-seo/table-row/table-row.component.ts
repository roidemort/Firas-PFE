import {Component, EventEmitter, Input, Output, ViewChild, ViewContainerRef} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import {DatePipe, NgForOf, NgIf} from "@angular/common";
import {ConfirmDialogComponent} from "../../../dialog/confirm-dialog/confirm-dialog.component";
import {Pharmacy} from "../../../../../../core/models/pharmacy.model";
import {Router, RouterLink} from "@angular/router";
import {Seo} from "../../../../../../core/models/seo.model";

@Component({
  selector: '[app-table-seo-row]',
  standalone: true,
  imports: [FormsModule, AngularSvgIconModule, DatePipe, NgIf, RouterLink, NgForOf],
  templateUrl: './table-row.component.html',
  styleUrl: './table-row.component.scss',
})
export class TableRowComponent {
  @Input() seo: Seo = <Seo>{};
  @ViewChild('actions', { static: true, read: ViewContainerRef })
  actions!: ViewContainerRef;

  @Output() updateSeo = new EventEmitter<any>();

  constructor(private router: Router) {}

  onChangeStatus($event: any, seoId: string, status: number) {
    $event.preventDefault();
    const confirmDialogComponent = this.actions.createComponent(ConfirmDialogComponent);
    confirmDialogComponent.instance.itemId = seoId
    confirmDialogComponent.instance.status = status
    confirmDialogComponent.instance.newStatus = $event.target.checked
    confirmDialogComponent.instance.type = 'seo'
    confirmDialogComponent.instance.closeActions.subscribe((res :any) => {
      if(res == 'done') {
        $event.target.checked =!$event.target.checked;  // Revert the status back
      }
      confirmDialogComponent.destroy()
    });
  }
  onEditSeo(seoIdId: string){
    this.updateSeo.emit(seoIdId);
  }
}
