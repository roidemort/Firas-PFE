import {Component, OnInit} from '@angular/core';
import {Lesson} from "../../../../../core/models/lesson.model";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {ToastrService} from "ngx-toastr";
import {ActivatedRoute, Router} from "@angular/router";
import {lastValueFrom} from "rxjs";
import {toast} from "ngx-sonner";
import {LessonsService} from "../../../../../core/services/lessons.service";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {MatOption} from "@angular/material/core";
import {MatSelect} from "@angular/material/select";
import {Editor, NgxEditorModule, toDoc, toHTML, Toolbar} from "ngx-editor";
import {Course} from "../../../../../core/models/course.entity";
import {CoursesService} from "../../../../../core/services/courses.service";

@Component({
  selector: 'app-manage-lesson',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    ReactiveFormsModule,
    NgClass,
    MatOption,
    MatSelect,
    NgForOf,
    NgxEditorModule
  ],
  templateUrl: './manage-lesson.component.html',
  styleUrl: './manage-lesson.component.scss'
})
export class ManageLessonComponent implements OnInit {
  type!: string | null
  lessonId!: string | null
  lesson!: Lesson

  manageLessonForm!: FormGroup;
  isLoading = false

  courses: Course[] = [];
  sectionId!: string | null
  courseId!: string | null
  selectedCourse!: Course | undefined
  selectedSection!: string

  courseTypes = [
    { value: 'pdf', label: 'PDF' },
    { value: 'video', label: 'Vidéo' },
  ]

  editor: Editor;
  toolbar: Toolbar = [
    ['bold', 'italic'],
    ['underline', 'strike'],
    ['code', 'blockquote'],
    ['ordered_list', 'bullet_list'],
    [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    ['link', 'image'],
    ['text_color', 'background_color'],
    ['align_left', 'align_center', 'align_right', 'align_justify'],
  ];

  constructor(private coursesService: CoursesService, private fb : FormBuilder, private lessonService: LessonsService, private toastr: ToastrService, private router: Router, private route: ActivatedRoute) {
    this.editor = new Editor();
  }
  async ngOnInit() {
    const result$ = this.coursesService.getAllCourses({ column: 'createdAt', direction: 'desc' }, 50, 0 , '', '', 'sections')
    const result = await lastValueFrom(result$);
    this.courses = result.data.courses

    this.type = this.route.snapshot.queryParamMap.get('type');
    this.lessonId = this.route.snapshot.queryParamMap.get('lessonId');

    this.manageLessonForm = this.fb.group({
      course:[null, Validators.required],
      section:[null, Validators.required],
      title: [null, Validators.required],
      type: [null, Validators.required],
      details: [null, Validators.required],
    });

    if (this.type == 'edit') {
      this.isLoading = true
      const result$ = this.lessonService.getLessonDetails(this.lessonId!)
      const result = await lastValueFrom(result$);
      this.lesson = result.data
      this.selectedCourse = this.courses.find(course => course.id === this.lesson?.section?.course?.id);
      this.selectedSection = this.lesson?.section?.id!

      this.manageLessonForm.get('course')!.disable();
      this.manageLessonForm.get('section')!.disable();
      this.manageLessonForm.patchValue({
        title: this.lesson.title,
        type: this.lesson.type,
        details: toDoc(this.lesson.details!),
        course: this.lesson.section?.course?.id,
        section: this.lesson.section?.id,
      });
      this.isLoading = false
    }
    if(this.type == 'add') {
      this.selectedCourse = this.courses.find(course => course.id === this.courseId);
      this.manageLessonForm.get('course')!.disable();
      this.manageLessonForm.get('section')!.disable();
      this.selectedSection = this.sectionId!
      this.manageLessonForm.patchValue({
        course: this.courseId,
        section: this.sectionId,
      });
    }
  }

  markAllAsTouched() {
    Object.keys(this.manageLessonForm.controls).forEach((key) => {
      this.manageLessonForm.get(key)?.markAsTouched();
    });
  }

  manageLesson(){
    this.markAllAsTouched();
    if (this.manageLessonForm.valid) {
      this.isLoading = true
      const data = {
        title: this.manageLessonForm.value.title,
        type: this.manageLessonForm.value.type,
        details: toHTML(this.manageLessonForm.value.details),
        sectionId: this.selectedSection,
      }
      if(this.type == 'edit') {
        this.lessonService.updateLesson(this.lesson.id!, data).subscribe({
          next: (result) => {
            if (result.status) {
              this.isLoading = false
              this.toastr.success('Leçon modifié avec succès', 'Enregistré', { timeOut: 1500 });
              this.router.navigate([`/admin985xilinp/dashboard/courses/lessons`]);
            } else {
              this.isLoading = false;
              this.toastr.warning('Vérifier vos données', 'Vérification', {
                timeOut: 1500
              })
            }
          },
          error: (error) => this.handleRequestError(error),
        });
      }
      if(this.type == 'add'|| this.type == 'new') {
        this.lessonService.addLesson(data).subscribe({
          next: (result) => {
            if (result.status) {
              this.isLoading = false
              this.toastr.success('Leçon ajouté avec succès', 'Enregistré', { timeOut: 1500 });
              this.router.navigate([`/admin985xilinp/dashboard/courses/lessons`]);
            } else {
              this.isLoading = false;
              this.toastr.warning('Vérifier vos données', 'Vérification', {
                timeOut: 1500
              })
            }
          },
          error: (error) => this.handleRequestError(error),
        });
      }
    }
  }
  private handleRequestError(error: any) {
    const msg = 'An error occurred while fetching users';
    toast.error(msg, {
      position: 'bottom-right',
      description: error.message,
      action: {
        label: 'Undo',
        onClick: () => console.log('Action!'),
      },
      actionButtonStyle: 'background-color:#DC2626; color:white;',
    });
  }
  bachToList() {
    this.router.navigate([`/admin985xilinp/dashboard/courses/lessons`]);
  }
  onSelectCourse($event: any) {
    this.selectedCourse = this.courses.find(course => course.id === $event.value);
  }
  onSelectSection($event: any) {
    this.selectedSection = $event.value
  }
}
