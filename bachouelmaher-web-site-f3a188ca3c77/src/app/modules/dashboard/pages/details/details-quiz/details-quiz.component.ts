import {Component, OnInit, signal, ViewChild, ViewContainerRef} from '@angular/core';
import {SortConfig} from "../../../../../core/models/config.model";
import {ActivatedRoute, Router} from "@angular/router";
import {QuizService} from "../../../../../core/services/quiz.service";
import {ToastrService} from "ngx-toastr";
import {toast} from "ngx-sonner";
import {Quiz} from "../../../../../core/models/quiz.model";
import {DatePipe, NgClass, NgIf} from "@angular/common";
import {SvgIconComponent} from "angular-svg-icon";
import {TableHeaderComponent} from "../../../components/tables/table-questions/table-header/table-header.component";
import {TableRowComponent} from "../../../components/tables/table-questions/table-row/table-row.component";
import {LoaderComponent} from "../../../../../shared/components/loader/loader.component";

@Component({
  selector: 'app-details-quiz',
  standalone: true,
  imports: [
    NgClass,
    DatePipe,
    SvgIconComponent,
    TableHeaderComponent,
    TableRowComponent,
    LoaderComponent,
    NgIf
  ],
  templateUrl: './details-quiz.component.html',
  styleUrl: './details-quiz.component.scss'
})
export class DetailsQuizComponent implements OnInit {
  @ViewChild('actions', { static: true, read: ViewContainerRef })
  actions!: ViewContainerRef;
  quizId?: string | null;
  isLoading = false
  quizDetails!: Quiz
  sortConfig = {} as SortConfig;

  allKeysCount : number = 0
  selectedStatus: string = ""
  searchText: string = ""
  itemsPerPage: number = 50;
  currentPage: number = 1;

  constructor(private route: ActivatedRoute, private quizService: QuizService, private toastr: ToastrService, private router: Router){

  }

  ngOnInit(): void {
    this.quizId = this.route.snapshot.paramMap.get('id');
    this.getQuizDetails()
  }

  private handleRequestError(error: any) {
    const msg = 'An error occurred while fetching users';
    this.isLoading = false
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

  getQuizDetails() {
    this.isLoading = true
    this.quizService.getQuizDetails(this.quizId!).subscribe({
      next: (result) => {
        if (result.status) {
          this.isLoading = false
          this.quizDetails = result.data
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
  updateQuestionStatus($event: any) {
    this.getQuizDetails()
  }
  manageQuestion(type: string, questionId?: string) {
    this.router.navigate([`/admin985xilinp/dashboard/courses/questions/manage-question`], { queryParams: { type: type,section: this.quizDetails.section?.id, course: this.quizDetails.section?.course?.id, questionId: questionId },queryParamsHandling: 'merge'  });
  }
}
