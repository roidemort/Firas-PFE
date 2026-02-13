import {Component, EventEmitter, Input, Output} from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import {NgxPaginationModule} from "ngx-pagination";
import {NgForOf, NgIf} from "@angular/common";

@Component({
  selector: 'app-table-seo-footer',
  standalone: true,
  imports: [AngularSvgIconModule, NgxPaginationModule, NgIf, NgForOf],
  templateUrl: './table-footer.component.html',
  styleUrl: './table-footer.component.scss',
})
export class TableFooterComponent {
  @Output() changeItemsPerPage = new EventEmitter<number>();

  @Input() currentPage!: number;
  @Input() itemsPerPage!: number;
  @Input() totalItems!: number;
  @Output() pageChanged: EventEmitter<number> = new EventEmitter();


  public onChangeItemsPerPage(event: any) {
    const value = event.target.value;
    this.changeItemsPerPage.emit(value);
  }
  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage) | 0;
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.pageChanged.emit(page);
    }
  }
}
