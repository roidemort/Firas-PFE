import {Component, ViewChild, ViewContainerRef} from '@angular/core';
import {SortConfig} from "../../../../core/models/config.model";
import {CertificatesService} from "../../../../core/services/certificates.service";
import {Router} from "@angular/router";
import {ConfirmDialogComponent} from "../../components/dialog/confirm-dialog/confirm-dialog.component";
import {toast} from "ngx-sonner";
import {Certificate} from "../../../../core/models/certificate.model";
import {DatePipe, NgClass, NgIf} from "@angular/common";
import {LoaderComponent} from "../../../../shared/components/loader/loader.component";
import {MatTooltip} from "@angular/material/tooltip";
import {SvgIconComponent} from "angular-svg-icon";
import {TableActionComponent} from "../../components/tables/table-courses/table-action/table-action.component";
import {TableFooterComponent} from "../../components/tables/table-courses/table-footer/table-footer.component";

@Component({
  selector: 'app-certificates',
  standalone: true,
  imports: [
    DatePipe,
    LoaderComponent,
    MatTooltip,
    NgIf,
    SvgIconComponent,
    TableActionComponent,
    TableFooterComponent,
    NgClass
  ],
  templateUrl: './certificates.component.html',
  styleUrl: './certificates.component.scss'
})
export class CertificatesComponent {
  @ViewChild('actions', { static: true, read: ViewContainerRef })
  actions!: ViewContainerRef;
  isLoading = false;
  certificates: Certificate[] = [];
  allCertificatesCount : number = 0
  selectedStatus: string = ""
  searchText: string = ""
  itemsPerPage: number = 10;
  currentPage: number = 1;
  sortConfig = {} as SortConfig;

  constructor(private certificatesService: CertificatesService, private router: Router) {
    this.getCertificates()
  }
  changeStatus($event: any, certificateId: string, status: number){
    $event.preventDefault();
    const confirmDialogComponent = this.actions.createComponent(ConfirmDialogComponent);
    confirmDialogComponent.instance.itemId = certificateId
    confirmDialogComponent.instance.status = status
    confirmDialogComponent.instance.newStatus = $event.target.checked
    confirmDialogComponent.instance.type = 'certificate'
    confirmDialogComponent.instance.closeActions.subscribe((res :any) => {
      if(res == 'done') {
        $event.target.checked =!$event.target.checked;  // Revert the status back
      }
      confirmDialogComponent.destroy()
    });
  }
  onChangeStatus(value: string){
    this.selectedStatus = value
    this.currentPage = 1
    this.getCertificates()
  }
  onChangeItemsPerPage(value: number){
    this.itemsPerPage = value
    this.currentPage = 1
    this.getCertificates()
  }
  onPageChange(page: number): void {
    this.currentPage = page;
    this.getCertificates()
  }
  onChangeText(value: string){
    this.searchText = value
    this.currentPage = 1
    this.getCertificates()
  }
  getCertificates() {
    this.isLoading = true
    this.certificatesService.getAllCertificates(this.sortConfig, this.itemsPerPage, this.currentPage ,this.searchText, this.selectedStatus).subscribe({
      next: (result) => {
        this.certificates = result.data.certificates
        this.allCertificatesCount = result.data.count
        this.isLoading = false
      },
      error: (error) => this.handleRequestError(error),
    });
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
  manageCertificate(type: string, certificateId?: string) {
    this.router.navigate([`/admin985xilinp/dashboard/courses/manage-certificate`], { queryParams: { type: type, certificateId: certificateId },queryParamsHandling: 'merge'  });
  }
}
