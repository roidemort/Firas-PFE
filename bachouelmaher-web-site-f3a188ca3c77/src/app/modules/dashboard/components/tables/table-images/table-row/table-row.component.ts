import {Component, EventEmitter, Input, Output, ViewChild, ViewContainerRef} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import {AsyncPipe, DatePipe, NgClass, NgIf, NgOptimizedImage} from "@angular/common";
import {RouterLink} from "@angular/router";
import {ClipboardModule} from "ngx-clipboard";
import {SortableComponent} from "../../../sortable/sortable.component";
import {Image} from "../../../../../../core/models/image.model";
import {ConvertSizeToString} from "../../../../../../shared/pipes/converter.pipes";

@Component({
  selector: '[app-table-image-row]',
  standalone: true,
  imports: [ClipboardModule, FormsModule, AngularSvgIconModule, DatePipe, NgIf, RouterLink, NgClass, AsyncPipe, SortableComponent, NgOptimizedImage, ConvertSizeToString],
  templateUrl: './table-row.component.html',
  styleUrl: './table-row.component.scss',
})
export class TableRowComponent {
  @Input() image: Image = <Image>{};
  @ViewChild('actions', { static: true, read: ViewContainerRef })
  actions!: ViewContainerRef;
  @Output() onCheck = new EventEmitter<{ value: boolean, imageId: string }>();
  constructor() {}
  public toggle(event: Event) {
    const value = (event.target as HTMLInputElement).checked;
    this.onCheck.emit({value, imageId: this.image.id});
  }
}
