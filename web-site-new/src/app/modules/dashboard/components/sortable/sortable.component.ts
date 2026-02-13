import {Component, Input} from '@angular/core';
import {NgIf} from "@angular/common";
import {SortConfig} from "../../../../core/models/config.model";

@Component({
  selector: 'app-sortable',
  standalone: true,
  imports: [
    NgIf
  ],
  templateUrl: './sortable.component.html',
  styleUrl: './sortable.component.scss'
})
export class SortableComponent {
  @Input() name!: string;
  @Input() sortConfig = {} as SortConfig;
}
