import {Component, OnInit, signal, ViewChild, ViewContainerRef} from '@angular/core';
import {SvgIconComponent} from "angular-svg-icon";
import {TableActionComponent} from "../../components/tables/table-images/table-action/table-action.component";
import {TableFooterComponent} from "../../components/tables/table-images/table-footer/table-footer.component";
import {TableHeaderComponent} from "../../components/tables/table-images/table-header/table-header.component";
import {TableRowComponent} from "../../components/tables/table-images/table-row/table-row.component";
import {SortConfig} from "../../../../core/models/config.model";
import {ToastrService} from "ngx-toastr";
import {Image} from "../../../../core/models/image.model";
import {MediasService} from "../../../../core/services/medias.service";
import {NgIf} from "@angular/common";
import {
  ConfirmDialogComponent
} from "../../components/dialog/confirm-dialog/confirm-dialog.component";
import {LoaderComponent} from "../../../../shared/components/loader/loader.component";
import {lastValueFrom} from "rxjs";
import {DragDirective} from "../../../../core/directives/dragDrop.directive";

@Component({
  selector: 'app-media',
  standalone: true,
  imports: [
    SvgIconComponent,
    TableActionComponent,
    TableFooterComponent,
    TableHeaderComponent,
    TableRowComponent,
    NgIf,
    LoaderComponent,
    DragDirective
  ],
  templateUrl: './media.component.html',
  styleUrl: './media.component.scss'
})
export class MediaComponent implements OnInit {
  @ViewChild('actions', { static: true, read: ViewContainerRef })
  actions!: ViewContainerRef;
  sortConfig = {} as SortConfig;
  allMediaCount : number = 0
  searchText: string = ""
  itemsPerPage: number = 10;
  currentPage: number = 1;
  isLoading = false
  selectedImages!: FileList;

  allMedia = signal<Image[]>([]);
  selectedMedia: Image[] = []

  constructor(private mediasService: MediasService, private toastr: ToastrService){

  }

  ngOnInit(): void {
    this.getAllMedia()
  }
  onChangeText(value: string){
    this.searchText = value
    this.currentPage = 1
    this.getAllMedia()
  }
  public sortKeys(sortConfig: any) {
    this.sortConfig = sortConfig
    this.getAllMedia()
  }
  onChangeItemsPerPage(value: number){
    this.itemsPerPage = value
    this.currentPage = 1
    this.getAllMedia()
  }
  onPageChange(page: number): void {
    this.currentPage = page;
    this.getAllMedia()
  }

  public toggleImages(checked: boolean) {
    this.allMedia.update((images) => {
      return images.map((image) => {
        return { ...image, selected: checked };
      });
    });
    this.selectedMedia = this.allMedia().filter((image: Image) => image.selected === true);
  }
  public toggleImage(data: { value: boolean; imageId: string }) {
    this.allMedia.update((images) => {
      return images.map((image) => {
        if(image.id == data.imageId) return {...image, selected: data.value}
        else return {...image }
      });
    });
    this.selectedMedia = this.allMedia().filter((image: Image) => image.selected === true);
  }
  getAllMedia() {
    this.selectedMedia = []
    this.isLoading = true
    this.mediasService.getAllImages(this.sortConfig, this.itemsPerPage, this.currentPage ,this.searchText).subscribe({
      next: (result) => {
        this.allMedia.set(result.data.images)
        this.allMediaCount = result.data.count
        this.isLoading = false
      },
      error: (error) => this.handleRequestError(error),
    });
  }
  private handleRequestError(error: any) {
    this.isLoading = false
    if(error.error.errorType === 'Unsupported' && error.status === 415) {
      this.toastr.error('Type de média non pris en charge', '', { timeOut: 6000 });
    }
  }
  onDeleteImages() {
    let result = this.selectedMedia.map(image => image.id);
    const confirmDialogComponent = this.actions.createComponent(ConfirmDialogComponent);
    confirmDialogComponent.instance.type = 'removeImages'
    confirmDialogComponent.instance.filesIds = result

    confirmDialogComponent.instance.closeActions.subscribe(async (res: any) => {
      if (res == 'done') {
        this.getAllMedia()
        this.selectedMedia = []
      }
      confirmDialogComponent.destroy()
    });
  }
  async filesDropped(files: FileList): Promise<void> {
    this.isLoading = true;
    this.selectedImages = files
    await this.upload()
  }
  async onImageSelected(event: Event): Promise<void> {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement?.files && inputElement.files.length > 0) {
      this.isLoading = true;
      this.selectedImages = inputElement.files;
      await this.upload()
    }
  }
  async upload(): Promise<void> {
    if (this.selectedImages) {
      await this.uploadFiles(this.selectedImages);
    }
  }
  private async uploadFiles(images: FileList): Promise<void> {
    let totalSuccessImages = 0
    let totalErrorImages = 0
    for (let index = 0; index < images.length; index++) {
      const element = images[index];
      const result$ = this.mediasService.addImage(element)
      await lastValueFrom(result$)
        .catch((error) => { this.handleRequestError(error) })
        .then(result => {
          if (result && result.status) {
            totalSuccessImages += 1
          } else {
            totalErrorImages += 1
          }
        })
    }
    this.isLoading = false;
    const message = '<p>' + totalSuccessImages + ' Images ajoutées avec succès </p>' +'<p>' + totalErrorImages + ' Images ajoutées ont échoué </p>'
    this.toastr.info(message, '' , { timeOut: 5000, enableHtml: true })
    this.getAllMedia()
  }
}
