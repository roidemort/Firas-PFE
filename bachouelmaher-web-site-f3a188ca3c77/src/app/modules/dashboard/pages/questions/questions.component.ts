import {Component, OnInit, signal, ViewChild, ViewContainerRef} from '@angular/core';
import {LoaderComponent} from "../../../../shared/components/loader/loader.component";
import {NgIf} from "@angular/common";
import {SvgIconComponent} from "angular-svg-icon";
import {Question} from "../../../../core/models/question.model";
import {SortConfig} from "../../../../core/models/config.model";
import {QuestionsService} from "../../../../core/services/questions.service";
import {Router} from "@angular/router";
import {toast} from "ngx-sonner";
import {TableActionComponent} from "../../components/tables/table-questions/table-action/table-action.component";
import {TableHeaderComponent} from "../../components/tables/table-questions/table-header/table-header.component";
import {TableRowComponent} from "../../components/tables/table-questions/table-row/table-row.component";
import {TableFooterComponent} from "../../components/tables/table-questions/table-footer/table-footer.component";

@Component({
  selector: 'app-questions',
  standalone: true,
  imports: [
    LoaderComponent,
    NgIf,
    SvgIconComponent,
    TableHeaderComponent,
    TableRowComponent,
    TableFooterComponent,
    TableActionComponent,
  ],
  templateUrl: './questions.component.html',
  styleUrl: './questions.component.scss'
})
export class QuestionsComponent implements OnInit {
  @ViewChild('actions', { static: true, read: ViewContainerRef })
  actions!: ViewContainerRef;
  isLoading = false;
  questions = signal<Question[]>([]);
  allQuestionsCount : number = 0
  selectedStatus: string = ""
  searchText: string = ""
  itemsPerPage: number = 10;
  currentPage: number = 1;
  sortConfig = {} as SortConfig;

  selectedCourse: string = ""
  selectedSection: string = ""

  constructor(private questionsService: QuestionsService, private router: Router) {
    this.getQuestions()
  }

  onChangeStatus(value: string){
    this.selectedStatus = value
    this.currentPage = 1
    this.getQuestions()
  }

  onChangeItemsPerPage(value: number){
    this.itemsPerPage = value
    this.currentPage = 1
    this.getQuestions()
  }
  onPageChange(page: number): void {
    this.currentPage = page;
    this.getQuestions()
  }
  public sortQuestions(sortConfig: any) {
    this.sortConfig = sortConfig
    this.getQuestions()
  }

  onChangeText(value: string){
    this.searchText = value
    this.currentPage = 1
    this.getQuestions()
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
    this.getQuestions()
  }
  onChangeSection(value: string){
    this.selectedSection = value
    this.currentPage = 1
    this.getQuestions()
  }
  getQuestions() {
    this.isLoading = true
    this.questionsService.getAllQuestions(this.sortConfig, this.itemsPerPage, this.currentPage ,this.searchText, this.selectedStatus, this.selectedCourse, this.selectedSection).subscribe({
      next: (result) => {
        this.questions.set(result.data.questions)
        this.allQuestionsCount = result.data.count
        this.isLoading = false
      },
      error: (error) => this.handleRequestError(error),
    });
  }
  manageQuestion(type: string, questionId?: string) {
    this.router.navigate([`/admin985xilinp/dashboard/courses/questions/manage-question`], { queryParams: { type: type, questionId: questionId },queryParamsHandling: 'merge'  });
  }
}
