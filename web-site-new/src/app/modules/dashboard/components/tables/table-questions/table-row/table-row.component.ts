import {Component, EventEmitter, Input, OnInit, Output, ViewChild, ViewContainerRef} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import {DatePipe, NgIf} from "@angular/common";
import {ConfirmDialogComponent} from "../../../dialog/confirm-dialog/confirm-dialog.component";
import {Question} from "../../../../../../core/models/question.model";
import {RouterLink} from "@angular/router";
import {questionTypes} from "../../../../../../core/constants/questionTypes";

@Component({
  selector: '[app-table-question-row]',
  standalone: true,
  imports: [FormsModule, AngularSvgIconModule, DatePipe, NgIf, RouterLink],
  templateUrl: './table-row.component.html',
  styleUrl: './table-row.component.scss',
})
export class TableRowComponent implements OnInit{
  @Input() question: Question = <Question>{};
  @ViewChild('actions', { static: true, read: ViewContainerRef })
  actions!: ViewContainerRef;
  newAnswer: string[] = []

  @Output() updateQuestion = new EventEmitter<any>();
  @Output() updateQuestionStatus = new EventEmitter<any>();
  private questionTypes = questionTypes;

  constructor() {

  }

  onChangeStatus($event: any, questionId: string, status: number) {
    $event.preventDefault();
    const confirmDialogComponent = this.actions.createComponent(ConfirmDialogComponent);
    confirmDialogComponent.instance.itemId = questionId
    confirmDialogComponent.instance.status = status
    confirmDialogComponent.instance.newStatus = $event.target.checked
    confirmDialogComponent.instance.type = 'question'
    confirmDialogComponent.instance.closeActions.subscribe((res :any) => {
      if(res == 'done') {
        $event.target.checked =!$event.target.checked;
        this.updateQuestionStatus.emit(true);
      }
      confirmDialogComponent.destroy()
    });
  }
  onEditQuestion(questionId: string){
    this.updateQuestion.emit(questionId);
  }
  getTypeDisplay(type: string): string {
    return this.questionTypes[type] || type;
  }

  ngOnInit(): void {
    if (this.question.type == 'CM' || this.question.type == 'CU') {
      this.newAnswer = this.question.answer.split(',')
    }
  }
}
