import {Component, OnInit, signal, ViewChild, ViewContainerRef} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {PharmaciesService} from "../../../../../core/services/pharmacies.service";
import {toast} from "ngx-sonner";
import {ToastrService} from "ngx-toastr";
import {SvgIconComponent} from "angular-svg-icon";
import {TableActionComponent} from "../../../components/tables/table-keys/table-action/table-action.component";
import {TableFooterComponent} from "../../../components/tables/table-keys/table-footer/table-footer.component";
import {TableHeaderComponent} from "../../../components/tables/table-keys/table-header/table-header.component";
import {TableRowComponent} from "../../../components/tables/table-keys/table-row/table-row.component";
import {DatePipe, NgClass, NgIf} from "@angular/common";
import {Key} from "../../../../../core/models/pharmacy.model";
import {SortConfig} from "../../../../../core/models/config.model";
import {LoaderComponent} from "../../../../../shared/components/loader/loader.component";
import {AddKeyDialogComponent} from "../../../components/dialog/add-key-dialog/add-key-dialog.component";

@Component({
  selector: 'app-details-pharmacy',
  standalone: true,
    imports: [
        SvgIconComponent,
        TableActionComponent,
        TableFooterComponent,
        TableHeaderComponent,
        TableRowComponent,
        NgIf,
        DatePipe,
        NgClass,
        LoaderComponent
    ],
  templateUrl: './details-pharmacy.component.html',
  styleUrl: './details-pharmacy.component.scss'
})
export class DetailsPharmacyComponent implements OnInit {
  @ViewChild('actions', { static: true, read: ViewContainerRef })
  actions!: ViewContainerRef;
  pharmacyId?: string | null;
  isLoading = false
  pharmacyDetails: any
  sortConfig = {} as SortConfig;

  allKeys = signal<Key[]>([]);

  allKeysCount : number = 0
  selectedStatus: string = ""
  searchText: string = ""
  itemsPerPage: number = 10;
  currentPage: number = 1;

  constructor(private route: ActivatedRoute, private pharmaciesService: PharmaciesService, private toastr: ToastrService){

  }

  ngOnInit(): void {
    this.pharmacyId = this.route.snapshot.paramMap.get('id');

    this.pharmaciesService.getPharmacyDetails(this.pharmacyId!).subscribe({
      next: (result) => {
        if (result.status) {
          this.isLoading = false
          this.pharmacyDetails = result.data
        } else {
          this.isLoading = false;
          this.toastr.warning('Vérifier vos données', 'Vérification', {
            timeOut: 1500
          })
        }
      },
      error: (error) => this.handleRequestError(error),
    });
    this.getAllKeys()
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

  onChangeStatus(value: string){
    this.selectedStatus = value
    this.currentPage = 1
    this.getAllKeys()
  }

  onChangeText(value: string){
    this.searchText = value
    this.currentPage = 1
    this.getAllKeys()
  }

  public sortKeys(sortConfig: any) {
    this.sortConfig = sortConfig
    this.getAllKeys()
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.getAllKeys()
  }

  onChangeItemsPerPage(value: number){
    this.itemsPerPage = value
    this.currentPage = 1
    this.getAllKeys()
  }

  getAllKeys() {
    this.isLoading = true
    this.pharmaciesService.getAllKeys(this.sortConfig, this.pharmacyId!, this.itemsPerPage, this.currentPage ,this.searchText, this.selectedStatus).subscribe({
      next: (result) => {
        this.allKeys.set(result.data.keys)
        this.allKeysCount = result.data.count
        this.isLoading = false
      },
      error: (error) => this.handleRequestError(error),
    });
  }
  generateNewKey() {
    const manageKeyDialogComponent = this.actions.createComponent(AddKeyDialogComponent);
    manageKeyDialogComponent.instance.closeActions.subscribe((res :any) => {
      if(res != 'close') {
        this.pharmaciesService.generateNewKey(this.pharmacyId!, res).subscribe({
          next: (result) => {
            if (result.status) {
              this.toastr.success('Générer une clé avec succès', 'Succès', {
                timeOut: 1500,
              });
              this.getAllKeys()
            }
            else {
              this.toastr.warning('Vérifier vos données', 'Vérification', {
                timeOut: 1500
              })
            }
          },
          error: (error) => this.handleRequestError(error),
        });
      }

      manageKeyDialogComponent.destroy()
    });


  }

}
