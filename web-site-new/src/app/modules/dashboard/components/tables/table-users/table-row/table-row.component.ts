import {Component, EventEmitter, Input, Output, ViewChild, ViewContainerRef} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import {User} from "../../../../../../core/models/user.model";
import {DatePipe, NgIf} from "@angular/common";
import {ConfirmDialogComponent} from "../../../dialog/confirm-dialog/confirm-dialog.component";
import {Router} from "@angular/router";
import { roles } from '../../../../../../core/constants/roles';

@Component({
  selector: '[app-table-user-row]',
  standalone: true,
  imports: [FormsModule, AngularSvgIconModule, DatePipe, NgIf],
  templateUrl: './table-row.component.html',
  styleUrl: './table-row.component.scss',
})
export class TableRowComponent {
  @Input() user: User = <User>{};
  @Input() editable: boolean = true;
  @ViewChild('actions', { static: true, read: ViewContainerRef })
  actions!: ViewContainerRef;
  @Output() updateUser = new EventEmitter<any>();
  roles = roles;


  constructor(private router: Router) {}

  onChangeStatus($event: any, userId: string, status: number) {
    $event.preventDefault();
    const confirmDialogComponent = this.actions.createComponent(ConfirmDialogComponent);
    confirmDialogComponent.instance.itemId = userId
    confirmDialogComponent.instance.status = status
    confirmDialogComponent.instance.newStatus = $event.target.checked
    confirmDialogComponent.instance.type = 'user'
    confirmDialogComponent.instance.closeActions.subscribe((res :any) => {
      if(res == 'done') {
        $event.target.checked =!$event.target.checked;  // Revert the status back
      }
      confirmDialogComponent.destroy()
    });
  }
  goToUserDetails(userId: string) {
    this.router.navigate([`/admin985xilinp/dashboard/details-user/${userId}`]);
  }
  onEditUser(userId: string){
    this.updateUser.emit(userId);
  }

  getRoleDisplayName(role: string): string {
    return this.roles[role.toUpperCase()] || role;
  }
}
