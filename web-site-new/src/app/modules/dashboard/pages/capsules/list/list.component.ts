import {Component, OnInit, signal, ViewChild, ViewContainerRef} from '@angular/core';
import {Capsule} from "../../../../../core/models/capsule.model";
import {SortConfig} from "../../../../../core/models/config.model";
import {CapsulesService} from "../../../../../core/services/capsules.service";
import {Router} from "@angular/router";
import {toast} from "ngx-sonner";
import {LoaderComponent} from "../../../../../shared/components/loader/loader.component";
import {NgIf} from "@angular/common";
import {SvgIconComponent} from "angular-svg-icon";
import {TableActionComponent} from "../../../components/tables/table-capsules/table-action/table-action.component";
import {TableHeaderComponent} from "../../../components/tables/table-capsules/table-header/table-header.component";
import {TableRowComponent} from "../../../components/tables/table-capsules/table-row/table-row.component";
import {TableFooterComponent} from "../../../components/tables/table-capsules/table-footer/table-footer.component";

@Component({
  selector: 'app-list',
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
    TableRowComponent,
    TableFooterComponent
  ],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent implements OnInit {
  @ViewChild('actions', { static: true, read: ViewContainerRef })
  actions!: ViewContainerRef;
  isLoading = false;
  capsules = signal<Capsule[]>([]);
  allCapsulesCount : number = 0
  selectedStatus: string = ""
  searchText: string = ""
  itemsPerPage: number = 10;
  currentPage: number = 1;
  sortConfig = {} as SortConfig;

  constructor(private capsulesService: CapsulesService, private router: Router) {
    this.getCapsules()
  }

  onChangeStatus(value: string){
    this.selectedStatus = value
    this.currentPage = 1
    this.getCapsules()
  }

  onChangeItemsPerPage(value: number){
    this.itemsPerPage = value
    this.currentPage = 1
    this.getCapsules()
  }
  onPageChange(page: number): void {
    this.currentPage = page;
    this.getCapsules()
  }
  public sortCapsules(sortConfig: any) {
    this.sortConfig = sortConfig
    this.getCapsules()
  }

  onChangeText(value: string){
    this.searchText = value
    this.currentPage = 1
    this.getCapsules()
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

  getCapsules() {
    this.isLoading = true
    this.capsulesService.getAllCapsules(this.sortConfig, this.itemsPerPage, this.currentPage ,this.searchText, this.selectedStatus).subscribe({
      next: (result) => {
        this.capsules.set(result.data.capsules)
        this.allCapsulesCount = result.data.count
        this.isLoading = false
      },
      error: (error) => this.handleRequestError(error),
    });
  }
  manageCapsule(type: string, capsuleId?: string) {
    this.router.navigate([`/admin985xilinp/dashboard/capsules/manage-capsule`], { queryParams: { type: type, capsuleId: capsuleId },queryParamsHandling: 'merge'  });
  }
}
