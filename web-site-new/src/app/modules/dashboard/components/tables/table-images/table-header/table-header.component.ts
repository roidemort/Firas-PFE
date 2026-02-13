import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import {SortableComponent} from "../../../sortable/sortable.component";
import {SortConfig} from "../../../../../../core/models/config.model";
import {BehaviorSubject, scan} from "rxjs";
import {NgIf} from "@angular/common";

@Component({
  selector: '[app-table-image-header]',
  standalone: true,
  imports: [AngularSvgIconModule, SortableComponent, NgIf],
  templateUrl: './table-header.component.html',
  styleUrl: './table-header.component.scss',
})
export class TableHeaderComponent implements OnInit {
  @Input() selectedType!: string;
  @Output() onSort = new EventEmitter<{}>();
  @Output() onCheck = new EventEmitter<boolean>();
  sortConfig = {} as SortConfig;
  sortableColumn$ = new BehaviorSubject<string>('');

  ngOnInit(): void {
    this.sortDirection$.subscribe((config) => {
      this.sortConfig = config;
    });
  }

  sortDirection$ = this.sortableColumn$.pipe(
    scan<string, SortConfig>(
      (config, column) => {
        return config.column === column
          ? { column, direction: config.direction === 'desc' ? 'asc' : 'desc' }
          : { column, direction: 'desc' };
      },
      { column: '',  direction: 'desc' }
    )
  );

  setSortColumn(column: string) {
    this.sortableColumn$.next(column);
    this.onSort.emit(this.sortConfig);
  }
  public toggle(event: Event) {
    const value = (event.target as HTMLInputElement).checked;
    this.onCheck.emit(value);
  }
}
