import {Component, EventEmitter, Output} from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {Course} from "../../../../../../core/models/course.entity";
import {lastValueFrom} from "rxjs";
import {CoursesService} from "../../../../../../core/services/courses.service";
import {NgForOf, NgIf} from "@angular/common";

@Component({
  selector: 'app-table-question-action',
  standalone: true,
  imports: [AngularSvgIconModule, ReactiveFormsModule, NgForOf, NgIf],
  templateUrl: './table-action.component.html',
  styleUrl: './table-action.component.scss',
})
export class TableActionComponent {
  @Output() changeStatus = new EventEmitter<string>();
  @Output() changeText = new EventEmitter<string>();

  form!: FormGroup;
  submitted = false;

  @Output() changeCourse = new EventEmitter<string>();
  @Output() changeSection = new EventEmitter<string>();
  courses: Course[] = [];
  selectedCourse!: Course | undefined

  constructor(private coursesService: CoursesService, private readonly _formBuilder: FormBuilder) {
    this.form = this._formBuilder.group({
      text: ['', ''],
    });
  }
  async ngOnInit() {
    const result$ = this.coursesService.getAllCourses({
      column: 'createdAt',
      direction: 'desc'
    }, 50, 0, '', '', 'sections')
    const result = await lastValueFrom(result$);
    this.courses = result.data.courses
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
  onSelectCourse($event: any) {
    this.selectedCourse = this.courses.find(course => course.id === $event.target.value);
    this.changeCourse.emit($event.target.value);
  }
  onSelectSection($event: any) {
    this.changeSection.emit($event.target.value);
  }
}
