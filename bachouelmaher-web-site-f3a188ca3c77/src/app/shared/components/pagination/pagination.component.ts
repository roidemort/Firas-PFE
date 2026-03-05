import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-center gap-2">
      <button
        (click)="previousPage()"
        [disabled]="page === 1"
        class="px-3 py-2 rounded-md border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
      >
        Previous
      </button>

      <div class="flex gap-1">
        <button
          *ngFor="let p of pageNumbers"
          (click)="goToPage(p)"
          [class.bg-blue-600]="p === page"
          [class.text-white]="p === page"
          [class.text-gray-700]="p !== page"
          class="px-3 py-2 rounded-md border border-gray-300 text-sm hover:bg-gray-100"
        >
          {{ p }}
        </button>
      </div>

      <button
        (click)="nextPage()"
        [disabled]="page === totalPages"
        class="px-3 py-2 rounded-md border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
      >
        Next
      </button>
    </div>
  `,
  styles: []
})
export class PaginationComponent {
  @Input() page: number = 1;
  @Input() itemsPerPage: number = 10;
  @Input() totalItems: number = 0;
  @Input() maxSize: number = 5;

  @Output() pageChange = new EventEmitter<number>();

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  get pageNumbers(): number[] {
    const half = Math.floor(this.maxSize / 2);
    let start = this.page - half;
    let end = this.page + half;

    if (start < 1) {
      start = 1;
      end = Math.min(this.totalPages, this.maxSize);
    }
    if (end > this.totalPages) {
      end = this.totalPages;
      start = Math.max(1, end - this.maxSize + 1);
    }

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  goToPage(pageNum: number): void {
    if (pageNum >= 1 && pageNum <= this.totalPages) {
      this.pageChange.emit(pageNum);
    }
  }

  previousPage(): void {
    if (this.page > 1) {
      this.goToPage(this.page - 1);
    }
  }

  nextPage(): void {
    if (this.page < this.totalPages) {
      this.goToPage(this.page + 1);
    }
  }
}

