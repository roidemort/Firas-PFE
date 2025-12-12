import {Component, OnInit, signal, ViewChild, ViewContainerRef} from '@angular/core';
import {Package} from "../../../../core/models/package.model";
import {SortConfig} from "../../../../core/models/config.model";
import {PackagesService} from "../../../../core/services/packages.service";
import {Router} from "@angular/router";
import {toast} from "ngx-sonner";
import {LoaderComponent} from "../../../../shared/components/loader/loader.component";
import {NgIf} from "@angular/common";
import {SvgIconComponent} from "angular-svg-icon";
import {TableActionComponent} from "../../components/tables/table-packages/table-action/table-action.component";
import {TableHeaderComponent} from "../../components/tables/table-packages/table-header/table-header.component";
import {TableRowComponent} from "../../components/tables/table-packages/table-row/table-row.component";
import {TableFooterComponent} from "../../components/tables/table-packages/table-footer/table-footer.component";

@Component({
  selector: 'app-packages',
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
  templateUrl: './packages.component.html',
  styleUrl: './packages.component.scss'
})
export class PackagesComponent implements OnInit {
  @ViewChild('actions', { static: true, read: ViewContainerRef })
  actions!: ViewContainerRef;
  isLoading = false;
  packages = signal<Package[]>([]);
  allPackagesCount : number = 0
  selectedStatus: string = ""
  searchText: string = ""
  itemsPerPage: number = 10;
  currentPage: number = 1;
  sortConfig = {} as SortConfig;

  constructor(private packagesService: PackagesService, private router: Router) {
    this.getPackages()
  }

  onChangeStatus(value: string){
    this.selectedStatus = value
    this.currentPage = 1
    this.getPackages()
  }

  onChangeItemsPerPage(value: number){
    this.itemsPerPage = value
    this.currentPage = 1
    this.getPackages()
  }
  onPageChange(page: number): void {
    this.currentPage = page;
    this.getPackages()
  }
  public sortPackages(sortConfig: any) {
    this.sortConfig = sortConfig
    this.getPackages()
  }

  onChangeText(value: string){
    this.searchText = value
    this.currentPage = 1
    this.getPackages()
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

  getPackages() {
    this.isLoading = true
    this.packagesService.getAllPackages(this.sortConfig, this.itemsPerPage, this.currentPage ,this.searchText, this.selectedStatus).subscribe({
      next: (result) => {
        this.packages.set(result.data.packages)
        this.allPackagesCount = result.data.count
        this.isLoading = false
      },
      error: (error) => this.handleRequestError(error),
    });
  }
  managePackage(type: string, packageId?: string) {
    this.router.navigate([`/admin985xilinp/dashboard/subscriptions/manage-package`], { queryParams: { type: type, packageId: packageId },queryParamsHandling: 'merge'  });
  }
}
