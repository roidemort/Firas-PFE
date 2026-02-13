import {Component, OnInit, signal, ViewChild, ViewContainerRef} from '@angular/core';
import {LoaderComponent} from "../../../../shared/components/loader/loader.component";
import {NgIf} from "@angular/common";
import {SvgIconComponent} from "angular-svg-icon";
import {Trainer} from "../../../../core/models/trainer.model";
import {SortConfig} from "../../../../core/models/config.model";
import {TrainersService} from "../../../../core/services/trainers.service";
import {Router} from "@angular/router";
import {toast} from "ngx-sonner";
import {TableActionComponent} from "../../components/tables/table-trainers/table-action/table-action.component";
import {TableHeaderComponent} from "../../components/tables/table-trainers/table-header/table-header.component";
import {TableRowComponent} from "../../components/tables/table-trainers/table-row/table-row.component";
import {TableFooterComponent} from "../../components/tables/table-trainers/table-footer/table-footer.component";

@Component({
  selector: 'app-trainers',
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
  templateUrl: './trainers.component.html',
  styleUrl: './trainers.component.scss'
})
export class TrainersComponent implements OnInit {
  @ViewChild('actions', { static: true, read: ViewContainerRef })
  actions!: ViewContainerRef;
  isLoading = false;
  trainers = signal<Trainer[]>([]);
  allTrainersCount : number = 0
  selectedStatus: string = ""
  selectedProvider: string = ""
  searchText: string = ""
  itemsPerPage: number = 10;
  currentPage: number = 1;
  sortConfig = {} as SortConfig;

  constructor(private trainersService: TrainersService, private router: Router) {
    this.getTrainers()
  }

  onChangeStatus(value: string){
    this.selectedStatus = value
    this.currentPage = 1
    this.getTrainers()
  }
  onChangeProvider(value: string){
    this.selectedProvider = value
    this.currentPage = 1
    this.getTrainers()
  }

  onChangeItemsPerPage(value: number){
    this.itemsPerPage = value
    this.currentPage = 1
    this.getTrainers()
  }
  onPageChange(page: number): void {
    this.currentPage = page;
    this.getTrainers()
  }
  public sortTrainers(sortConfig: any) {
    this.sortConfig = sortConfig
    this.getTrainers()
  }

  onChangeText(value: string){
    this.searchText = value
    this.currentPage = 1
    this.getTrainers()
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

  getTrainers() {
    this.isLoading = true
    this.trainersService.getAllTrainers(this.sortConfig, this.itemsPerPage, this.currentPage ,this.searchText, this.selectedStatus, this.selectedProvider).subscribe({
      next: (result) => {
        this.trainers.set(result.data.trainers)
        this.allTrainersCount = result.data.count
        this.isLoading = false
      },
      error: (error) => this.handleRequestError(error),
    });
  }
  manageTrainer(type: string, trainerId?: string) {
    this.router.navigate([`/admin985xilinp/dashboard/manage-trainer`], { queryParams: { type: type, trainerId: trainerId },queryParamsHandling: 'merge'  });
  }
}
