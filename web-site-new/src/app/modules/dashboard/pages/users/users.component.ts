import {Component, OnInit, signal, ViewChild, ViewContainerRef} from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { FormsModule } from '@angular/forms';
import { TableHeaderComponent } from '../../components/tables/table-users/table-header/table-header.component';
import { TableFooterComponent } from '../../components/tables/table-users/table-footer/table-footer.component';
import { TableRowComponent } from '../../components/tables/table-users/table-row/table-row.component';
import { TableActionComponent } from '../../components/tables/table-users/table-action/table-action.component';
import { toast } from 'ngx-sonner';
import {User} from "../../../../core/models/user.model";
import {UsersService} from "../../../../core/services/users.service";
import {NgxPaginationModule} from "ngx-pagination";
import {SortConfig} from "../../../../core/models/config.model";
import {LoaderComponent} from "../../../../shared/components/loader/loader.component";
import {NgIf} from "@angular/common";
import {Router} from "@angular/router";

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [
    AngularSvgIconModule,
    FormsModule,
    TableHeaderComponent,
    TableFooterComponent,
    TableRowComponent,
    TableActionComponent,
    NgxPaginationModule,
    LoaderComponent,
    NgIf,
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
})
export class UsersComponent implements OnInit {
  users = signal<User[]>([]);
  @ViewChild('actions', { static: true, read: ViewContainerRef })
  actions!: ViewContainerRef;
  allUsersCount : number = 0
  selectedRole: string = ""
  selectedStatus: string = ""
  selectedGender: string = ""
  searchText: string = ""
  itemsPerPage: number = 10;
  currentPage: number = 1;
  sortConfig = {} as SortConfig;
  isLoading = false;

  constructor(private usersService: UsersService, private router: Router) {
    this.getUsers()
  }

  public sortUsers(sortConfig: any) {
    this.sortConfig = sortConfig
    this.getUsers()
  }

  onChangeRole(value: string){
    this.selectedRole = value
    this.currentPage = 1
    this.getUsers()
  }
  onChangeStatus(value: string){
    this.selectedStatus = value
    this.currentPage = 1
    this.getUsers()
  }

  onChangeItemsPerPage(value: number){
    this.itemsPerPage = value
    this.currentPage = 1
    this.getUsers()
  }
  onPageChange(page: number): void {
    this.currentPage = page;
    this.getUsers()
  }

  onChangeGender(value: string){
    this.selectedGender = value
    this.currentPage = 1
    this.getUsers()
  }

  onChangeText(value: string){
    this.searchText = value
    this.currentPage = 1
    this.getUsers()
  }
  manageUser(type: string, userId?: string) {
    this.router.navigate([`/admin985xilinp/dashboard/manage-user`], { queryParams: { type: type, userId: userId },queryParamsHandling: 'merge'  });
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

  getUsers() {
    this.isLoading = true
    this.usersService.getAllUsers(this.sortConfig, this.itemsPerPage, this.currentPage ,this.searchText, this.selectedRole, this.selectedStatus, this.selectedGender).subscribe({
      next: (result) => {
        this.isLoading = false
        this.users.set(result.data.users)
        this.allUsersCount = result.data.count
      },
      error: (error) => this.handleRequestError(error),
    });
  }
}
