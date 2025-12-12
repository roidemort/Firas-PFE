import {Component, OnInit} from '@angular/core';
import {SortConfig} from "../../../../../core/models/config.model";
import {ActivatedRoute} from "@angular/router";
import {ToastrService} from "ngx-toastr";
import {CoursesService} from "../../../../../core/services/courses.service";
import {toast} from "ngx-sonner";
import {DatePipe, NgClass, NgForOf, NgIf, TitleCasePipe, UpperCasePipe} from "@angular/common";
import {LoaderComponent} from "../../../../../shared/components/loader/loader.component";
import {SvgIconComponent} from "angular-svg-icon";
import { roles } from '../../../../../core/constants/roles';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {NgxEditorModule} from "ngx-editor";
import {TableHeaderComponent} from "../../../components/tables/table-course-user/table-header/table-header.component";
import {TableRowComponent} from "../../../components/tables/table-course-user/table-row/table-row.component";
import {TableFooterComponent} from "../../../components/tables/table-course-user/table-footer/table-footer.component";
import {TableActionComponent} from "../../../components/tables/table-course-user/table-action/table-action.component";

@Component({
  selector: 'app-details-course',
  standalone: true,
  imports: [
    DatePipe,
    LoaderComponent,
    NgIf,
    SvgIconComponent,
    NgClass,
    UpperCasePipe,
    TitleCasePipe,
    NgForOf,
    FormsModule,
    NgxEditorModule,
    ReactiveFormsModule,
    TableHeaderComponent,
    TableRowComponent,
    TableFooterComponent,
    TableActionComponent,

  ],
  templateUrl: './details-course.component.html',
  styleUrl: './details-course.component.scss'
})
export class DetailsCourseComponent implements OnInit{
  courseId?: string | null;
  isLoading = false
  courseDetails: any

  sortConfig = {} as SortConfig;

  allUsers: any;
  roles = roles;
  allUsersCount : number = 0
  selectedStatus: string = ""
  searchText: string = ""
  searchPharmacy: string = ""
  itemsPerPage: number = 10;
  currentPage: number = 1;

  constructor(private route: ActivatedRoute, private coursesService: CoursesService, private toastr: ToastrService){

  }

  ngOnInit(): void {
    this.courseId = this.route.snapshot.paramMap.get('id');

    this.coursesService.getCourseDetails(this.courseId!).subscribe({
      next: (result) => {
        if (result.status) {
          this.isLoading = false
          this.courseDetails = result.data
        } else {
          this.isLoading = false;
          this.toastr.warning('Vérifier vos données', 'Vérification', {
            timeOut: 1500
          })
        }
      },
      error: (error) => this.handleRequestError(error),
    });
    this.getAllUsers()
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
  getRoleDisplayName(role: string): string {
    return this.roles[role.toUpperCase()] || role;
  }
  public sortCourses(sortConfig: any) {
    this.sortConfig = sortConfig
    this.getAllUsers()
  }
  onChangeItemsPerPage(value: number){
    this.itemsPerPage = value
    this.currentPage = 1
    this.getAllUsers()
  }
  onPageChange(page: number): void {
    this.currentPage = page;
    this.getAllUsers()
  }
  onChangePharmacy(value: string){
    this.searchPharmacy = value
    this.currentPage = 1
    this.getAllUsers()
  }
  getAllUsers() {
    this.isLoading = true
    this.coursesService.getUserEnrollCourse(this.courseId!, this.sortConfig, this.itemsPerPage, this.currentPage, this.searchPharmacy).subscribe({
      next: (result) => {
        this.allUsers = result.data.users
        this.allUsersCount = result.data.count
        this.isLoading = false
      },
      error: (error) => this.handleRequestError(error),
    });
  }
}
