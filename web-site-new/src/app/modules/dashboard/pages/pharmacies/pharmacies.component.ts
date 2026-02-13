import {Component, OnInit, signal, ViewChild, ViewContainerRef} from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { FormsModule } from '@angular/forms';
import { TableHeaderComponent } from '../../components/tables/table-pharmacies/table-header/table-header.component';
import { TableFooterComponent } from '../../components/tables/table-pharmacies/table-footer/table-footer.component';
import { TableRowComponent } from '../../components/tables/table-pharmacies/table-row/table-row.component';
import { TableActionComponent } from '../../components/tables/table-pharmacies/table-action/table-action.component';
import { toast } from 'ngx-sonner';
import {NgxPaginationModule} from "ngx-pagination";
import {PharmaciesService} from "../../../../core/services/pharmacies.service";
import {Pharmacy} from "../../../../core/models/pharmacy.model";

import {NgIf} from "@angular/common";
import {SortConfig} from "../../../../core/models/config.model";
import {LoaderComponent} from "../../../../shared/components/loader/loader.component";
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
        NgIf,
        LoaderComponent,
    ],
  templateUrl: './pharmacies.component.html',
  styleUrl: './pharmacies.component.scss',
})
export class PharmaciesComponent implements OnInit {
  @ViewChild('actions', { static: true, read: ViewContainerRef })
  actions!: ViewContainerRef;
  isLoading = false;
  pharmacies = signal<Pharmacy[]>([]);
  allPharmaciesCount : number = 0
  selectedStatus: string = ""
  searchText: string = ""
  itemsPerPage: number = 10;
  currentPage: number = 1;
  sortConfig = {} as SortConfig;

  constructor(private pharmaciesService: PharmaciesService, private router: Router) {
    this.getPharmacies()
  }

  onChangeStatus(value: string){
    this.selectedStatus = value
    this.currentPage = 1
    this.getPharmacies()
  }

  onChangeItemsPerPage(value: number){
    this.itemsPerPage = value
    this.currentPage = 1
    this.getPharmacies()
  }
  onPageChange(page: number): void {
    this.currentPage = page;
    this.getPharmacies()
  }
  public sortPharmacies(sortConfig: any) {
    this.sortConfig = sortConfig
    this.getPharmacies()
  }

  onChangeText(value: string){
    this.searchText = value
    this.currentPage = 1
    this.getPharmacies()
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

  getPharmacies() {
    this.isLoading = true
    this.pharmaciesService.getAllPharmacies(this.sortConfig, this.itemsPerPage, this.currentPage ,this.searchText, this.selectedStatus).subscribe({
      next: (result) => {
        this.pharmacies.set(result.data.pharmacies)
        this.allPharmaciesCount = result.data.count
        this.isLoading = false
      },
      error: (error) => this.handleRequestError(error),
    });
  }
  managePharmacy(type: string, pharmacyId?: string) {
    this.router.navigate([`/admin985xilinp/dashboard/manage-pharmacy`], { queryParams: { type: type, pharmacyId: pharmacyId },queryParamsHandling: 'merge'  });
  }
}
