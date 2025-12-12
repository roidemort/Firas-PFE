import {Component, signal, ViewChild, ViewContainerRef} from '@angular/core';
import {SvgIconComponent} from "angular-svg-icon";
import {LoaderComponent} from "../../../../shared/components/loader/loader.component";
import {DatePipe, NgClass, NgIf} from "@angular/common";
import {MatTooltip} from "@angular/material/tooltip";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {Router} from "@angular/router";
import {CoursesService} from "../../../../core/services/courses.service";
import {TableFooterComponent} from "../../components/tables/table-courses/table-footer/table-footer.component";
import {SortConfig} from "../../../../core/models/config.model";
import {Course} from "../../../../core/models/course.entity";
import {toast} from "ngx-sonner";
import {TableActionComponent} from "../../components/tables/table-courses/table-action/table-action.component";
import {ConfirmDialogComponent} from "../../components/dialog/confirm-dialog/confirm-dialog.component";

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [
    SvgIconComponent,
    LoaderComponent,
    NgIf,
    MatTooltip,
    FormsModule,
    ReactiveFormsModule,
    DatePipe,
    TableFooterComponent,
    TableFooterComponent,
    TableActionComponent,
    TableActionComponent,
    NgClass
  ],
  templateUrl: './courses.component.html',
  styleUrl: './courses.component.scss'
})
export class CoursesComponent {
  @ViewChild('actions', { static: true, read: ViewContainerRef })
  actions!: ViewContainerRef;
  isLoading = false;
  courses: Course[] = [];
  allCoursesCount : number = 0
  selectedStatus: string = ""
  searchText: string = ""
  searchPrice: string = ""
  searchCS: string = ""
  itemsPerPage: number = 10;
  currentPage: number = 1;
  sortConfig = {} as SortConfig;

  constructor(private coursesService: CoursesService, private router: Router) {
    this.getCourses()
  }
  changeStatus($event: any, courseId: string, status: number){
    $event.preventDefault();
    const confirmDialogComponent = this.actions.createComponent(ConfirmDialogComponent);
    confirmDialogComponent.instance.itemId = courseId
    confirmDialogComponent.instance.status = status
    confirmDialogComponent.instance.newStatus = $event.target.checked
    confirmDialogComponent.instance.type = 'course'
    confirmDialogComponent.instance.closeActions.subscribe((res :any) => {
      if(res == 'done') {
        $event.target.checked =!$event.target.checked;  // Revert the status back
      }
      confirmDialogComponent.destroy()
    });
  }
  onChangeStatus(value: string){
    this.selectedStatus = value
    this.currentPage = 1
    this.getCourses()
  }
  onChangeItemsPerPage(value: number){
    this.itemsPerPage = value
    this.currentPage = 1
    this.getCourses()
  }
  onPageChange(page: number): void {
    this.currentPage = page;
    this.getCourses()
  }
  onChangeText(value: string){
    this.searchText = value
    this.currentPage = 1
    this.getCourses()
  }
  onChangePrice(value: string){
    this.searchPrice = value
    this.currentPage = 1
    this.getCourses()
  }
  onChangeCS(value: string){
    this.searchCS = value
    this.currentPage = 1
    this.getCourses()
  }
  getCourses() {
    this.isLoading = true
    this.coursesService.getAllCourses(this.sortConfig, this.itemsPerPage, this.currentPage ,this.searchText, this.selectedStatus, '', this.searchPrice, this.searchCS).subscribe({
      next: (result) => {
        this.courses = result.data.courses
        this.allCoursesCount = result.data.count
        this.isLoading = false
      },
      error: (error) => this.handleRequestError(error),
    });
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
  manageCourse(type: string, courseId?: string) {
    this.router.navigate([`/admin985xilinp/dashboard/courses/manage-course`], { queryParams: { type: type, courseId: courseId },queryParamsHandling: 'merge'  });
  }
  detailsCourse(courseId?: string) {
    this.router.navigate([`/admin985xilinp/dashboard/courses/details-course/${courseId}`]);
  }
}
