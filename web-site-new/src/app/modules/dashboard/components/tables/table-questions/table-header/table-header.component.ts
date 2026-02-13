import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import {SortableComponent} from "../../../sortable/sortable.component";
import {SortConfig} from "../../../../../../core/models/config.model";
import {BehaviorSubject, scan} from "rxjs";
import {Question} from "../../../../../../core/models/question.model";
import {NgClass, NgIf} from "@angular/common";

@Component({
  selector: '[app-table-question-header]',
  standalone: true,
  imports: [AngularSvgIconModule, SortableComponent, NgIf, NgClass],
  templateUrl: './table-header.component.html',
  styleUrl: './table-header.component.scss',
})
export class TableHeaderComponent implements OnInit {
  @Output() onSort = new EventEmitter<{}>();
  @Input() sortable: boolean = true;

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
}
