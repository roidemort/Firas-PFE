import {Component, OnInit, signal, ViewChild, ViewContainerRef} from '@angular/core';
import {Advertisement} from "../../../../core/models/advertisement.model";
import {SortConfig} from "../../../../core/models/config.model";
import {AdvertisementsService} from "../../../../core/services/advertisements.service";
import {Router} from "@angular/router";
import {toast} from "ngx-sonner";
import {LoaderComponent} from "../../../../shared/components/loader/loader.component";
import {NgIf} from "@angular/common";
import {SvgIconComponent} from "angular-svg-icon";
import {TableActionComponent} from "../../components/tables/table-advertisements/table-action/table-action.component";
import {TableHeaderComponent} from "../../components/tables/table-advertisements/table-header/table-header.component";
import {TableRowComponent} from "../../components/tables/table-advertisements/table-row/table-row.component";
import {TableFooterComponent} from "../../components/tables/table-advertisements/table-footer/table-footer.component";

@Component({
  selector: 'app-advertisements',
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
  templateUrl: './advertisements.component.html',
  styleUrl: './advertisements.component.scss'
})
export class AdvertisementsComponent implements OnInit {
  @ViewChild('actions', { static: true, read: ViewContainerRef })
  actions!: ViewContainerRef;
  isLoading = false;
  advertisements = signal<Advertisement[]>([]);
  allAdvertisementsCount : number = 0
  selectedStatus: string = ""
  searchType: string = ""
  searchText: string = ""
  itemsPerPage: number = 10;
  currentPage: number = 1;
  sortConfig = {} as SortConfig;

  constructor(private advertisementsService: AdvertisementsService, private router: Router) {
    this.getAdvertisements()
  }

  onChangeStatus(value: string){
    this.selectedStatus = value
    this.currentPage = 1
    this.getAdvertisements()
  }

  onChangeType(value: string){
    this.searchType = value
    this.currentPage = 1
    this.getAdvertisements()
  }

  onChangeItemsPerPage(value: number){
    this.itemsPerPage = value
    this.currentPage = 1
    this.getAdvertisements()
  }
  onPageChange(page: number): void {
    this.currentPage = page;
    this.getAdvertisements()
  }
  public sortAdvertisements(sortConfig: any) {
    this.sortConfig = sortConfig
    this.getAdvertisements()
  }

  onChangeText(value: string){
    this.searchText = value
    this.currentPage = 1
    this.getAdvertisements()
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

  getAdvertisements() {
    this.isLoading = true
    this.advertisementsService.getAllAdvertisements(this.sortConfig, this.itemsPerPage, this.currentPage ,this.searchText, this.selectedStatus, this.searchType).subscribe({
      next: (result) => {
        this.advertisements.set(result.data.advertisements)
        this.allAdvertisementsCount = result.data.count
        this.isLoading = false
      },
      error: (error) => this.handleRequestError(error),
    });
  }
  manageAdvertisement(type: string, advertisementId?: string) {
    this.router.navigate([`/admin985xilinp/dashboard/manage-advertisement`], { queryParams: { type: type, advertisementId: advertisementId },queryParamsHandling: 'merge'  });
  }
}
