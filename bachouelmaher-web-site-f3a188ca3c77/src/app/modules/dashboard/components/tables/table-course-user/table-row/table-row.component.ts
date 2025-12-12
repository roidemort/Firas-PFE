import {
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import {DatePipe, DecimalPipe} from "@angular/common";
import {UserCourse} from "../../../../../../core/models/user.model";
import {ProgressionComponent} from "../../../progression/progression.component";
import {Router} from "@angular/router";
import {MatButton, MatButtonModule} from "@angular/material/button";
import {MatDrawer, MatDrawerContainer, MatSidenavModule} from "@angular/material/sidenav";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatSelectModule} from "@angular/material/select";
import {ChatService} from "../../../../../../core/services/chat.service";
import {UsersService} from "../../../../../../core/services/users.service";
import {toast} from "ngx-sonner";

@Component({
  selector: '[app-table-course-user-row]',
  standalone: true,
  imports: [FormsModule, AngularSvgIconModule, DatePipe, ProgressionComponent, MatSidenavModule, MatFormFieldModule, MatSelectModule, MatButtonModule, DecimalPipe],
  templateUrl: './table-row.component.html',
  styleUrl: './table-row.component.scss',
})
export class TableRowComponent implements OnInit{
  @Input() userCourse!: any;
  @ViewChild('actions', { static: true, read: ViewContainerRef })
  actions!: ViewContainerRef;
  isLoading = false
  countUserMessages = 0

  constructor(private router: Router, private chatService: ChatService, private usersService: UsersService) {}
  goToUserDetails(userId: string | undefined) {
    this.router.navigate([`/admin985xilinp/dashboard/details-user/${userId}`]);
  }
  goToPharmacyDetails(pharmacyId: string | undefined) {
    this.router.navigate([`/admin985xilinp/dashboard/details-pharmacy/${pharmacyId}`]);
  }
  openConversation(userID: string | undefined, courseID: string | undefined) {
    this.chatService.toggleChat(true);
    this.chatService.loadChatData(userID, courseID);
    this.countUserMessages = 0
  }

  ngOnInit(): void {
    this.usersService.countConversation(this.userCourse.user.id, this.userCourse.course.id).subscribe({
      next: (result) => {
        if (result.status) {
          this.countUserMessages = result.data
          this.isLoading = false
        }
      },
      error: (error) => this.handleRequestError(error),
    });
  }
  private handleRequestError(error: any) {
    this.isLoading = false
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
