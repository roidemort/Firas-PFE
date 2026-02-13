import {Component, OnInit, signal, ViewChild, ViewContainerRef} from '@angular/core';
import {Provider} from "../../../../core/models/provider.model";
import {SortConfig} from "../../../../core/models/config.model";
import {ProvidersService} from "../../../../core/services/providers.service";
import {Router} from "@angular/router";
import {toast} from "ngx-sonner";
import {LoaderComponent} from "../../../../shared/components/loader/loader.component";
import {NgIf} from "@angular/common";
import {SvgIconComponent} from "angular-svg-icon";
import {TableActionComponent} from "../../components/tables/table-providers/table-action/table-action.component";
import {TableHeaderComponent} from "../../components/tables/table-providers/table-header/table-header.component";
import {TableRowComponent} from "../../components/tables/table-providers/table-row/table-row.component";
import {TableFooterComponent} from "../../components/tables/table-providers/table-footer/table-footer.component";

@Component({
  selector: 'app-providers',
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
  templateUrl: './providers.component.html',
  styleUrl: './providers.component.scss'
})
export class ProvidersComponent implements OnInit {
  @ViewChild('actions', { static: true, read: ViewContainerRef })
  actions!: ViewContainerRef;
  isLoading = false;
  providers = signal<Provider[]>([]);
  allProvidersCount : number = 0
  selectedStatus: string = ""
  searchText: string = ""
  itemsPerPage: number = 10;
  currentPage: number = 1;
  sortConfig = {} as SortConfig;

  constructor(private providersService: ProvidersService, private router: Router) {
    this.getProviders()
  }

  onChangeStatus(value: string){
    this.selectedStatus = value
    this.currentPage = 1
    this.getProviders()
  }

  onChangeItemsPerPage(value: number){
    this.itemsPerPage = value
    this.currentPage = 1
    this.getProviders()
  }
  onPageChange(page: number): void {
    this.currentPage = page;
    this.getProviders()
  }
  public sortProviders(sortConfig: any) {
    this.sortConfig = sortConfig
    this.getProviders()
  }

  onChangeText(value: string){
    this.searchText = value
    this.currentPage = 1
    this.getProviders()
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

  getProviders() {
    this.isLoading = true
    this.providersService.getAllProviders(this.sortConfig, this.itemsPerPage, this.currentPage ,this.searchText, this.selectedStatus).subscribe({
      next: (result) => {
        this.providers.set(result.data.providers)
        this.allProvidersCount = result.data.count
        this.isLoading = false
      },
      error: (error) => this.handleRequestError(error),
    });
  }
  manageProvider(type: string, providerId?: string) {
    this.router.navigate([`/admin985xilinp/dashboard/manage-provider`], { queryParams: { type: type, providerId: providerId },queryParamsHandling: 'merge'  });
  }
}
