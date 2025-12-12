import {Component, EventEmitter, Output} from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {NgForOf} from "@angular/common";
import {Package} from "../../../../../../core/models/package.model";
import {PackagesService} from "../../../../../../core/services/packages.service";
import {SortConfig} from "../../../../../../core/models/config.model";
import {toast} from "ngx-sonner";

@Component({
  selector: 'app-table-subscription-action',
  standalone: true,
  imports: [AngularSvgIconModule, ReactiveFormsModule, NgForOf],
  templateUrl: './table-action.component.html',
  styleUrl: './table-action.component.scss',
})
export class TableActionComponent {
  @Output() changeStatus = new EventEmitter<string>();
  @Output() changeDate = new EventEmitter<string>();
  @Output() changePackage = new EventEmitter<string>();

  packages : Package[] = [];
  submitted = false;

  constructor(private packagesService: PackagesService) {
    this.packagesService.getAllPackages({ column: 'position', direction: 'asc' } as SortConfig, 10, 0 , '', '').subscribe({
      next: (result) => {
        this.packages = result.data.packages
      },
      error: (error) => this.handleRequestError(error),
    });
  }

  onChangeStatus($event: any){
    this.changeStatus.emit($event.target.value);
  }
  onChangeDate($event: any){
    this.changeDate.emit($event.target.value);
  }
  onChangePackage($event: any){
    this.changePackage.emit($event.target.value);
  }
  private handleRequestError(error: any) {
    const msg = 'An error occurred while fetching users';
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
}
