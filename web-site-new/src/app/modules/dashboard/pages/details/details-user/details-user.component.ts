import {Component, ElementRef, OnInit, signal, ViewChild, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute, RouterLink} from "@angular/router";
import {ToastrService} from "ngx-toastr";
import {toast} from "ngx-sonner";
import {User, UserCourse} from "../../../../../core/models/user.model";
import {UsersService} from "../../../../../core/services/users.service";
import {DatePipe, NgClass, NgIf} from "@angular/common";
import { roles } from '../../../../../core/constants/roles';
import {SvgIconComponent} from "angular-svg-icon";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {Editor, NgxEditorModule, Toolbar, toHTML, toDoc} from 'ngx-editor';
import { schema } from 'ngx-editor/schema';
import {TableActionComponent} from "../../../components/tables/table-user-course/table-action/table-action.component";
import {TableHeaderComponent} from "../../../components/tables/table-user-course/table-header/table-header.component";
import {TableFooterComponent} from "../../../components/tables/table-user-course/table-footer/table-footer.component";
import {TableRowComponent} from "../../../components/tables/table-user-course/table-row/table-row.component";
import {SortConfig} from "../../../../../core/models/config.model";

@Component({
  selector: 'app-details-user',
  standalone: true,
  imports: [
    NgIf,
    DatePipe,
    NgClass,
    RouterLink,
    SvgIconComponent,
    ReactiveFormsModule,
    NgxEditorModule,
    TableActionComponent,
    TableFooterComponent,
    TableHeaderComponent,
    TableRowComponent,
    TableActionComponent,
    TableHeaderComponent,
    TableFooterComponent,
    TableRowComponent
  ],
  templateUrl: './details-user.component.html',
  styleUrl: './details-user.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class DetailsUserComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;
  userId?: string | null;
  isLoading = false
  userDetails?: User
  userCourses = signal<UserCourse[]>([]);
  allCourseCount: number = 0
  roles = roles;

  selectedFile!: File;

  manageEmailForm!: FormGroup;

  sortConfig = {} as SortConfig;
  selectedStatus: string = ""
  searchText: string = ""
  itemsPerPage: number = 10;
  currentPage: number = 1;

  editor: Editor;
  toolbar: Toolbar = [
    ['bold', 'italic'],
    ['underline', 'strike'],
    ['code', 'blockquote'],
    ['ordered_list', 'bullet_list'],
    [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    ['link', 'image'],
    ['text_color', 'background_color'],
    ['align_left', 'align_center', 'align_right', 'align_justify'],
  ];

  constructor(private fb : FormBuilder, private route: ActivatedRoute, private usersService: UsersService, private toastr: ToastrService){
    this.editor = new Editor({
      content: '',
      plugins: [],
      schema,
      nodeViews: {},
      history: true,
      keyboardShortcuts: true,
      inputRules: true,
    });
  }

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id');

    this.usersService.getUserDetails(this.userId!).subscribe({
      next: (result) => {
        if (result.status) {
          this.isLoading = false
          this.userDetails = result.data.user
        } else {
          this.isLoading = false;
          this.toastr.warning('Vérifier vos données', 'Vérification', {
            timeOut: 1500
          })
        }
      },
      error: (error) => this.handleRequestError(error),
    });
    this.getAllCourses()

    this.manageEmailForm = this.fb.group({
      text: [null, Validators.required],
      subject: [null, [Validators.required]],
    });
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

  getRoleDisplayName(role: any): string {
    if(role) return this.roles[role.toUpperCase()] || role;
    else return '';
  }
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      const formData = new FormData();
      formData.append('upload', this.selectedFile);
      this.usersService.updateUser(this.userId!, formData).subscribe(
        (res) => {
          if (res.status) {
            this.userDetails!.img_link = res.data.user.img_link;
            this.toastr.success('Information modifier avec succès', 'Success', {
              timeOut: 1500,
            });
          } else {
            this.toastr.warning('Verifier vos informations', 'Warning', {
              timeOut: 1500,
            });
          }
        },
        (error) => {
          this.toastr.error('Erreur interne du serveur', 'Erreur', {
            timeOut: 1500,
          });
        }
      );
    }
  }
  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }
  markAllAsTouched() {
    Object.keys(this.manageEmailForm.controls).forEach((key) => {
      this.manageEmailForm.get(key)?.markAsTouched();
    });
  }
  resetForm(form: FormGroup) {
    form.reset();
    Object.keys(form.controls).forEach(key => {
      form.get(key)?.setErrors(null) ;
    });
  }
  sendNotification(){
    this.markAllAsTouched();
    if (this.manageEmailForm.valid) {
      this.isLoading = true
      const data = {
        usersIds: [this.userId],
        text: toHTML(this.manageEmailForm.value.text),
        subject: this.manageEmailForm.value.subject,
      }
      this.usersService.sendNotifications(data).subscribe({
        next: (result) => {
          if (result.status) {
            this.isLoading = false
            this.resetForm(this.manageEmailForm)
            this.toastr.success('Email envoyé avec succès', 'Enregistré', { timeOut: 3000 });
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

  onChangeStatus(value: string){
    this.selectedStatus = value
    this.currentPage = 1
    this.getAllCourses()
  }
  public sortCourses(sortConfig: any) {
    this.sortConfig = sortConfig
    this.getAllCourses()
  }
  onChangeItemsPerPage(value: number){
    this.itemsPerPage = value
    this.currentPage = 1
    this.getAllCourses()
  }
  onPageChange(page: number): void {
    this.currentPage = page;
    this.getAllCourses()
  }
  getAllCourses() {
    this.isLoading = true
    this.usersService.userCourseEnroll(this.userId!, this.sortConfig, this.itemsPerPage, this.currentPage , this.selectedStatus).subscribe({
      next: (result) => {
        this.userCourses.set(result.data.courses)
        this.allCourseCount = result.data.count
        this.isLoading = false
      },
      error: (error) => this.handleRequestError(error),
    });
  }

}
