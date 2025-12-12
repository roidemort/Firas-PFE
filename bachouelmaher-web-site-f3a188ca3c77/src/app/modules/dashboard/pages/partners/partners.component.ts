import {Component, OnInit, signal, ViewChild, ViewContainerRef} from '@angular/core';
import {LoaderComponent} from "../../../../shared/components/loader/loader.component";
import {NgIf} from "@angular/common";
import {SvgIconComponent} from "angular-svg-icon";
import {TableActionComponent} from "../../components/tables/table-partners/table-action/table-action.component";
import {TableFooterComponent} from "../../components/tables/table-partners/table-footer/table-footer.component";
import {TableHeaderComponent} from "../../components/tables/table-partners/table-header/table-header.component";
import {TableRowComponent} from "../../components/tables/table-partners/table-row/table-row.component";
import {Partner} from "../../../../core/models/partner.model";
import {SortConfig} from "../../../../core/models/config.model";
import {Router} from "@angular/router";
import {toast} from "ngx-sonner";
import {PartnersService} from "../../../../core/services/partners.service";

@Component({
  selector: 'app-partners',
  standalone: true,
    imports: [
        LoaderComponent,
        NgIf,
        SvgIconComponent,
        TableActionComponent,
        TableFooterComponent,
        TableHeaderComponent,
        TableRowComponent
    ],
  templateUrl: './partners.component.html',
  styleUrl: './partners.component.scss'
})
export class PartnersComponent  implements OnInit {
  @ViewChild('actions', { static: true, read: ViewContainerRef })
  actions!: ViewContainerRef;
  isLoading = false;
  partners = signal<Partner[]>([]);
  allPartnersCount : number = 0
  selectedStatus: string = ""
  searchText: string = ""
  itemsPerPage: number = 10;
  currentPage: number = 1;
  sortConfig = {} as SortConfig;

  constructor(private partnersService: PartnersService, private router: Router) {
    this.getPartners()
  }

  onChangeStatus(value: string){
    this.selectedStatus = value
    this.currentPage = 1
    this.getPartners()
  }

  onChangeItemsPerPage(value: number){
    this.itemsPerPage = value
    this.currentPage = 1
    this.getPartners()
  }
  onPageChange(page: number): void {
    this.currentPage = page;
    this.getPartners()
  }
  public sortPartners(sortConfig: any) {
    this.sortConfig = sortConfig
    this.getPartners()
  }

  onChangeText(value: string){
    this.searchText = value
    this.currentPage = 1
    this.getPartners()
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

  getPartners() {
    this.isLoading = true
    this.partnersService.getAllPartners(this.sortConfig, this.itemsPerPage, this.currentPage ,this.searchText, this.selectedStatus).subscribe({
      next: (result) => {
        this.partners.set(result.data.partners)
        this.allPartnersCount = result.data.count
        this.isLoading = false
      },
      error: (error) => this.handleRequestError(error),
    });
  }
  managePartner(type: string, partnerId?: string) {
    this.router.navigate([`/admin985xilinp/dashboard/manage-partner`], { queryParams: { type: type, partnerId: partnerId },queryParamsHandling: 'merge'  });
  }
}
