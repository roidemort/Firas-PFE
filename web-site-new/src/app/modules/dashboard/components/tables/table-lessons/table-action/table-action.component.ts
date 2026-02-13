import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatSelect} from "@angular/material/select";
import {NgForOf, NgIf} from "@angular/common";
import {Course} from "../../../../../../core/models/course.entity";
import {MatOption} from "@angular/material/autocomplete";
import {lastValueFrom} from "rxjs";
import {CoursesService} from "../../../../../../core/services/courses.service";

@Component({
  selector: 'app-table-lesson-action',
  standalone: true,
  imports: [AngularSvgIconModule, ReactiveFormsModule, MatOption, MatSelect, NgForOf, NgIf],
  templateUrl: './table-action.component.html',
  styleUrl: './table-action.component.scss',
})
export class TableActionComponent implements OnInit {
  @Output() changeStatus = new EventEmitter<string>();
  @Output() changeText = new EventEmitter<string>();

  @Output() changeCourse = new EventEmitter<string>();
  @Output() changeSection = new EventEmitter<string>();

  form!: FormGroup;
  submitted = false;

  courses: Course[] = [];
  selectedCourse!: Course | undefined

  constructor(private coursesService: CoursesService, private readonly _formBuilder: FormBuilder) {
    this.form = this._formBuilder.group({
      text: ['', ''],
    });
  }

  get f() {
    return this.form.controls;
  }

  onChangeStatus($event: any){
    this.changeStatus.emit($event.target.value);
  }
  onSubmit() {
    this.submitted = true;
    const { text } = this.form.value;
    this.changeText.emit(text);
  }

  async ngOnInit() {
    const result$ = this.coursesService.getAllCourses({
      column: 'createdAt',
      direction: 'desc'
    }, 50, 0, '', '', 'sections')
    const result = await lastValueFrom(result$);
    this.courses = result.data.courses
  }
  onSelectCourse($event: any) {
    this.selectedCourse = this.courses.find(course => course.id === $event.target.value);
    this.changeCourse.emit($event.target.value);
  }
  onSelectSection($event: any) {
    this.changeSection.emit($event.target.value);
  }
}
