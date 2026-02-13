import {Component, OnInit, signal, ViewChild, ViewContainerRef} from '@angular/core';
import {LoaderComponent} from "../../../../shared/components/loader/loader.component";
import {NgIf} from "@angular/common";
import {SvgIconComponent} from "angular-svg-icon";
import {SortConfig} from "../../../../core/models/config.model";
import {TrendsService} from "../../../../core/services/trends.service";
import {Router} from "@angular/router";
import {toast} from "ngx-sonner";
import {TableActionComponent} from "../../components/tables/table-trends/table-action/table-action.component";
import {TableHeaderComponent} from "../../components/tables/table-trends/table-header/table-header.component";
import {TableRowComponent} from "../../components/tables/table-trends/table-row/table-row.component";
import {TableFooterComponent} from "../../components/tables/table-trends/table-footer/table-footer.component";
import {Trend} from "../../../../core/models/Trend.model";

@Component({
  selector: 'app-trends',
  standalone: true,
  imports: [
    LoaderComponent,
    NgIf,
    SvgIconComponent,
    TableActionComponent,
    TableHeaderComponent,
    TableRowComponent,
    TableFooterComponent
  ],
  templateUrl: './trends.component.html',
  styleUrl: './trends.component.scss'
})
export class TrendsComponent implements OnInit {
  @ViewChild('actions', { static: true, read: ViewContainerRef })
  actions!: ViewContainerRef;
  isLoading = false;
  trends = signal<Trend[]>([]);
  allTrendsCount : number = 0
  selectedStatus: string = ""
  searchText: string = ""
  itemsPerPage: number = 10;
  currentPage: number = 1;
  sortConfig = {} as SortConfig;

  constructor(private trendsService: TrendsService, private router: Router) {
    this.getTrends()
  }

  onChangeStatus(value: string){
    this.selectedStatus = value
    this.currentPage = 1
    this.getTrends()
  }

  onChangeItemsPerPage(value: number){
    this.itemsPerPage = value
    this.currentPage = 1
    this.getTrends()
  }
  onPageChange(page: number): void {
    this.currentPage = page;
    this.getTrends()
  }
  public sortTrends(sortConfig: any) {
    this.sortConfig = sortConfig
    this.getTrends()
  }

  onChangeText(value: string){
    this.searchText = value
    this.currentPage = 1
    this.getTrends()
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

  getTrends() {
    this.isLoading = true
    this.trendsService.getAllTrends(this.sortConfig, this.itemsPerPage, this.currentPage ,this.searchText, this.selectedStatus).subscribe({
      next: (result) => {
        this.trends.set(result.data.trends)
        this.allTrendsCount = result.data.count
        this.isLoading = false
      },
      error: (error) => this.handleRequestError(error),
    });
  }
  manageTrend(type: string, trendId?: string) {
    this.router.navigate([`/admin985xilinp/dashboard/manage-trend`], { queryParams: { type: type, trendId: trendId },queryParamsHandling: 'merge'  });
  }
}
