import {Component, OnInit} from '@angular/core';
import {Quiz} from "../../../../../core/models/quiz.model";
import {NgxMaterialIntlTelInputComponent, TextLabels} from "ngx-material-intl-tel-input";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {QuizService} from "../../../../../core/services/quiz.service";
import {ToastrService} from "ngx-toastr";
import {ActivatedRoute, Router} from "@angular/router";
import {lastValueFrom} from "rxjs";
import {toast} from "ngx-sonner";
import {NgClass, NgIf} from "@angular/common";

@Component({
  selector: 'app-manage-quiz',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    NgxMaterialIntlTelInputComponent,
    ReactiveFormsModule,
    NgClass
  ],
  templateUrl: './manage-quiz.component.html',
  styleUrl: './manage-quiz.component.scss'
})
export class ManageQuizComponent implements OnInit {
  type!: string | null
  quizId!: string | null
  quiz!: Quiz

  manageQuizForm!: FormGroup;
  isLoading = false

  constructor(private fb : FormBuilder, private quizService: QuizService, private toastr: ToastrService, private router: Router, private route: ActivatedRoute) {}
  async ngOnInit() {
    this.type = this.route.snapshot.queryParamMap.get('type');
    this.quizId = this.route.snapshot.queryParamMap.get('quizId');

    this.manageQuizForm = this.fb.group({
      title: [null, Validators.required],
      details: [null, Validators.required],
      passingGrade: [null, Validators.required],
    });

    if (this.type == 'edit') {
      this.isLoading = true
      const result$ = this.quizService.getQuizDetails(this.quizId!)
      const result = await lastValueFrom(result$);

      this.quiz = result.data
      this.manageQuizForm.patchValue({
        title: this.quiz.title,
        details: this.quiz.details,
        passingGrade: this.quiz.passingGrade,
      });
      this.isLoading = false
    }
  }

  markAllAsTouched() {
    Object.keys(this.manageQuizForm.controls).forEach((key) => {
      this.manageQuizForm.get(key)?.markAsTouched();
    });
  }

  manageQuiz(){
    this.markAllAsTouched();
    if (this.manageQuizForm.valid) {
      this.isLoading = true
      const data = {
        title: this.manageQuizForm.value.title,
        details: this.manageQuizForm.value.details,
        passingGrade: this.manageQuizForm.value.passingGrade,
      }
      if(this.type == 'edit') {
        this.quizService.updateQuiz(this.quiz.id, data).subscribe({
          next: (result) => {
            if (result.status) {
              this.isLoading = false
              this.toastr.success('Quiz modifié avec succès', 'Enregistré', { timeOut: 1500 });
              this.router.navigate([`/admin985xilinp/dashboard/courses/quiz`]);
            } else {
              this.isLoading = false;
              this.toastr.warning('Vérifier vos données', 'Vérification', {
                timeOut: 1500
              })
            }
          },
          error: (error) => this.handleRequestError(error),
        });
      }
    }
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
  bachToList() {
    this.router.navigate([`/admin985xilinp/dashboard/courses/quiz`]);
  }
}
