import {Component, EventEmitter, Input, Output, ViewChild, ViewContainerRef} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import {DatePipe, NgIf} from "@angular/common";
import {ConfirmDialogComponent} from "../../../dialog/confirm-dialog/confirm-dialog.component";
import {Router, RouterLink} from "@angular/router";
import {Quiz} from "../../../../../../core/models/quiz.model";
import {MatTooltipModule} from "@angular/material/tooltip";

@Component({
  selector: '[app-table-quiz-row]',
  standalone: true,
  imports: [FormsModule, AngularSvgIconModule, DatePipe, NgIf, RouterLink, MatTooltipModule],
  templateUrl: './table-row.component.html',
  styleUrl: './table-row.component.scss',
})
export class TableRowComponent {
  @Input() quiz: Quiz = <Quiz>{};
  @ViewChild('actions', { static: true, read: ViewContainerRef })
  actions!: ViewContainerRef;

  @Output() updateQuiz = new EventEmitter<any>();

  constructor(private router: Router) {}

  onChangeStatus($event: any, quizId: string, status: number) {
    $event.preventDefault();
    const confirmDialogComponent = this.actions.createComponent(ConfirmDialogComponent);
    confirmDialogComponent.instance.itemId = quizId
    confirmDialogComponent.instance.status = status
    confirmDialogComponent.instance.newStatus = $event.target.checked
    confirmDialogComponent.instance.type = 'quiz'
    confirmDialogComponent.instance.closeActions.subscribe((res :any) => {
      if(res == 'done') {
        $event.target.checked =!$event.target.checked;  // Revert the status back
      }
      confirmDialogComponent.destroy()
    });
  }
  onEditQuiz(quizId: string){
    this.updateQuiz.emit(quizId);
  }
  goToQuizDetails(quizId: string) {
    this.router.navigate([`/admin985xilinp/dashboard/courses/quiz/details-quiz/${quizId}`]);
  }
}
