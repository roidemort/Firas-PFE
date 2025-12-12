import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {UsersService} from "../../../../core/services/users.service";
import {toast} from "ngx-sonner";
import {UserCourse} from "../../../../core/models/user.model";

@Component({
  selector: 'app-progression',
  standalone: true,
  imports: [],
  templateUrl: './progression.component.html',
  styleUrl: './progression.component.scss'
})
export class ProgressionComponent implements OnChanges {
  @Input() userCourse!: UserCourse;

  progression: number =  0

  constructor(private usersService: UsersService) {
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

  ngOnInit(): void {

  }
  ngOnChanges(changes: SimpleChanges): void {
    if(this.userCourse.status == 2) {
      this.progression=100
    } else {
      this.usersService.courseEnrollProgression({userId: this.userCourse.user.id, courseId: this.userCourse.id}).subscribe({
        next: (result) => {
          this.progression = result.data.course.progression
        },
        error: (error) => this.handleRequestError(error),
      });
    }
  }
}
