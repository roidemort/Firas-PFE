import {Component, EventEmitter, Input, Output, ViewChild, ViewContainerRef} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import {DatePipe, NgForOf, NgIf} from "@angular/common";
import {ConfirmDialogComponent} from "../../../dialog/confirm-dialog/confirm-dialog.component";
import {Trainer} from "../../../../../../core/models/trainer.model";
import {Router, RouterLink} from "@angular/router";

@Component({
  selector: '[app-table-trainer-row]',
  standalone: true,
  imports: [FormsModule, AngularSvgIconModule, DatePipe, NgIf, RouterLink, NgForOf],
  templateUrl: './table-row.component.html',
  styleUrl: './table-row.component.scss',
})
export class TableRowComponent {
  @Input() trainer: Trainer = <Trainer>{};
  @ViewChild('actions', { static: true, read: ViewContainerRef })
  actions!: ViewContainerRef;

  @Output() updateTrainer = new EventEmitter<any>();

  constructor() {}

  onChangeStatus($event: any, trainerId: string, status: number) {
    $event.preventDefault();
    const confirmDialogComponent = this.actions.createComponent(ConfirmDialogComponent);
    confirmDialogComponent.instance.itemId = trainerId
    confirmDialogComponent.instance.status = status
    confirmDialogComponent.instance.newStatus = $event.target.checked
    confirmDialogComponent.instance.type = 'trainer'
    confirmDialogComponent.instance.closeActions.subscribe((res :any) => {
      if(res == 'done') {
        $event.target.checked =!$event.target.checked;  // Revert the status back
      }
      confirmDialogComponent.destroy()
    });
  }
  onEditTrainer(trainerId: string){
    this.updateTrainer.emit(trainerId);
  }
}
