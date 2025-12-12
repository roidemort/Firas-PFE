import {Component, OnInit, signal, ViewChild, ViewContainerRef} from '@angular/core';
import {Seo} from "../../../../core/models/seo.model";
import {SortConfig} from "../../../../core/models/config.model";
import {Router} from "@angular/router";
import {toast} from "ngx-sonner";
import {SeoService} from "../../../../core/services/seo.service";
import {LoaderComponent} from "../../../../shared/components/loader/loader.component";
import {NgIf} from "@angular/common";
import {SvgIconComponent} from "angular-svg-icon";
import {TableActionComponent} from "../../components/tables/table-seo/table-action/table-action.component";
import {TableFooterComponent} from "../../components/tables/table-seo/table-footer/table-footer.component";
import {TableHeaderComponent} from "../../components/tables/table-seo/table-header/table-header.component";
import {TableRowComponent} from "../../components/tables/table-seo/table-row/table-row.component";

@Component({
  selector: 'app-seo',
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
  templateUrl: './seo.component.html',
  styleUrl: './seo.component.scss'
})
export class SeoComponent implements OnInit {
  @ViewChild('actions', {static: true, read: ViewContainerRef})
  actions!: ViewContainerRef;
  isLoading = false;
  seos = signal<Seo[]>([]);
  allSeosCount: number = 0
  selectedStatus: string = ""
  searchText: string = ""
  itemsPerPage: number = 10;
  currentPage: number = 1;
  sortConfig = {} as SortConfig;

  constructor(private seosService: SeoService, private router: Router) {
    this.getSeos()
  }

  onChangeStatus(value: string) {
    this.selectedStatus = value
    this.currentPage = 1
    this.getSeos()
  }

  onChangeItemsPerPage(value: number) {
    this.itemsPerPage = value
    this.currentPage = 1
    this.getSeos()
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.getSeos()
  }

  public sortSeos(sortConfig: any) {
    this.sortConfig = sortConfig
    this.getSeos()
  }

  onChangeText(value: string) {
    this.searchText = value
    this.currentPage = 1
    this.getSeos()
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

  ngOnInit() {
  }

  getSeos() {
    this.isLoading = true
    this.seosService.getAllSEOs(this.sortConfig, this.itemsPerPage, this.currentPage, this.searchText, this.selectedStatus).subscribe({
      next: (result) => {
        this.seos.set(result.data.seo)
        this.allSeosCount = result.data.count
        this.isLoading = false
      },
      error: (error) => this.handleRequestError(error),
    });
  }

  manageSeo(type: string, seoId?: string) {
    this.router.navigate([`/admin985xilinp/dashboard/manage-seo`], {
      queryParams: {
        type: type,
        seoId: seoId
      }, queryParamsHandling: 'merge'
    });
  }
}
