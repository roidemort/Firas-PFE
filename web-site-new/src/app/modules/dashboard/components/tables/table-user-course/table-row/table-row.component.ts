import {
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import {DatePipe} from "@angular/common";
import {UserCourse} from "../../../../../../core/models/user.model";
import {ProgressionComponent} from "../../../progression/progression.component";

@Component({
  selector: '[app-table-user-course-row]',
  standalone: true,
  imports: [FormsModule, AngularSvgIconModule, DatePipe, ProgressionComponent],
  templateUrl: './table-row.component.html',
  styleUrl: './table-row.component.scss',
})
export class TableRowComponent {
  @Input() userCourse!: UserCourse;
  @ViewChild('actions', { static: true, read: ViewContainerRef })
  actions!: ViewContainerRef;
  isLoading = false

  constructor() {}

}
