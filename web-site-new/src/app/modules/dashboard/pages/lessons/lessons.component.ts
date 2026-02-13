import {Component, OnInit, signal, ViewChild, ViewContainerRef} from '@angular/core';
import {Lesson} from "../../../../core/models/lesson.model";
import {SortConfig} from "../../../../core/models/config.model";
import {LessonsService} from "../../../../core/services/lessons.service";
import {Router} from "@angular/router";
import {toast} from "ngx-sonner";
import {LoaderComponent} from "../../../../shared/components/loader/loader.component";
import {NgIf} from "@angular/common";
import {SvgIconComponent} from "angular-svg-icon";
import {TableActionComponent} from "../../components/tables/table-lessons/table-action/table-action.component";
import {TableHeaderComponent} from "../../components/tables/table-lessons/table-header/table-header.component";
import {TableFooterComponent} from "../../components/tables/table-lessons/table-footer/table-footer.component";
import {TableRowComponent} from "../../components/tables/table-lessons/table-row/table-row.component";

@Component({
  selector: 'app-lessons',
  standalone: true,
  imports: [
    LoaderComponent,
    NgIf,
    SvgIconComponent,
    TableActionComponent,
    TableFooterComponent,
    TableHeaderComponent,
    TableRowComponent,
    TableActionComponent,
    TableHeaderComponent,
    TableFooterComponent,
    TableRowComponent
  ],
  templateUrl: './lessons.component.html',
  styleUrl: './lessons.component.scss'
})
export class LessonsComponent implements OnInit {
  @ViewChild('actions', { static: true, read: ViewContainerRef })
  actions!: ViewContainerRef;
  isLoading = false;
  lessons = signal<Lesson[]>([]);
  allLessonsCount : number = 0
  selectedStatus: string = ""
  selectedCourse: string = ""
  selectedSection: string = ""
  searchText: string = ""
  itemsPerPage: number = 10;
  currentPage: number = 1;
  sortConfig = {} as SortConfig;

  constructor(private lessonsService: LessonsService, private router: Router) {
    this.getLessons()
  }

  onChangeStatus(value: string){
    this.selectedStatus = value
    this.currentPage = 1
    this.getLessons()
  }
  onChangeCourse(value: string){
    this.selectedCourse = value
    this.currentPage = 1
    this.getLessons()
  }
  onChangeSection(value: string){
    this.selectedSection = value
    this.currentPage = 1
    this.getLessons()
  }

  onChangeItemsPerPage(value: number){
    this.itemsPerPage = value
    this.currentPage = 1
    this.getLessons()
  }
  onPageChange(page: number): void {
    this.currentPage = page;
    this.getLessons()
  }
  public sortLessons(sortConfig: any) {
    this.sortConfig = sortConfig
    this.getLessons()
  }

  onChangeText(value: string){
    this.searchText = value
    this.currentPage = 1
    this.getLessons()
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

  getLessons() {
    this.isLoading = true
    this.lessonsService.getAllLesson(this.sortConfig, this.itemsPerPage, this.currentPage ,this.searchText, this.selectedStatus, this.selectedCourse, this.selectedSection).subscribe({
      next: (result) => {
        this.lessons.set(result.data.lesson)
        this.allLessonsCount = result.data.count
        this.isLoading = false
      },
      error: (error) => this.handleRequestError(error),
    });
  }
  manageLesson(type: string, lessonId?: string) {
    this.router.navigate([`/admin985xilinp/dashboard/courses/manage-lesson`], { queryParams: { type: type, lessonId: lessonId },queryParamsHandling: 'merge'  });
  }
}
