import {Component, OnInit, signal, ViewChild, ViewContainerRef} from '@angular/core';
import {Quiz} from "../../../../core/models/quiz.model";
import {SortConfig} from "../../../../core/models/config.model";
import {QuizService} from "../../../../core/services/quiz.service";
import {Router} from "@angular/router";
import {toast} from "ngx-sonner";
import {LoaderComponent} from "../../../../shared/components/loader/loader.component";
import {NgIf} from "@angular/common";
import {SvgIconComponent} from "angular-svg-icon";
import {TableActionComponent} from "../../components/tables/table-quiz/table-action/table-action.component";
import {TableHeaderComponent} from "../../components/tables/table-quiz/table-header/table-header.component";
import {TableRowComponent} from "../../components/tables/table-quiz/table-row/table-row.component";
import {TableFooterComponent} from "../../components/tables/table-quiz/table-footer/table-footer.component";

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [
    LoaderComponent,
    NgIf,
    SvgIconComponent,
    TableFooterComponent,
    TableHeaderComponent,
    TableRowComponent,
    TableHeaderComponent,
    TableRowComponent,
    TableFooterComponent,
    TableActionComponent
  ],
  templateUrl: './quiz.component.html',
  styleUrl: './quiz.component.scss'
})
export class QuizComponent implements OnInit {
  @ViewChild('actions', { static: true, read: ViewContainerRef })
  actions!: ViewContainerRef;
  isLoading = false;
  quiz = signal<Quiz[]>([]);
  allQuizCount : number = 0
  selectedStatus: string = ""
  searchText: string = ""
  itemsPerPage: number = 10;
  currentPage: number = 1;
  sortConfig = {} as SortConfig;

  selectedCourse: string = ""
  selectedSection: string = ""

  constructor(private quizService: QuizService, private router: Router) {
    this.getQuiz()
  }

  onChangeStatus(value: string){
    this.selectedStatus = value
    this.currentPage = 1
    this.getQuiz()
  }

  onChangeItemsPerPage(value: number){
    this.itemsPerPage = value
    this.currentPage = 1
    this.getQuiz()
  }
  onPageChange(page: number): void {
    this.currentPage = page;
    this.getQuiz()
  }
  public sortQuiz(sortConfig: any) {
    this.sortConfig = sortConfig
    this.getQuiz()
  }

  onChangeText(value: string){
    this.searchText = value
    this.currentPage = 1
    this.getQuiz()
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

  ngOnInit() {}
  onChangeCourse(value: string){
    this.selectedCourse = value
    this.currentPage = 1
    this.getQuiz()
  }
  onChangeSection(value: string){
    this.selectedSection = value
    this.currentPage = 1
    this.getQuiz()
  }
  getQuiz() {
    this.isLoading = true
    this.quizService.getAllQuiz(this.sortConfig, this.itemsPerPage, this.currentPage ,this.searchText, this.selectedStatus, this.selectedCourse, this.selectedSection).subscribe({
      next: (result) => {
        this.quiz.set(result.data.quiz)
        this.allQuizCount = result.data.count
        this.isLoading = false
      },
      error: (error) => this.handleRequestError(error),
    });
  }
  manageQuiz(type: string, quizId?: string) {
    this.router.navigate([`/admin985xilinp/dashboard/courses/manage-quiz`], { queryParams: { type: type, quizId: quizId },queryParamsHandling: 'merge'  });
  }
}
