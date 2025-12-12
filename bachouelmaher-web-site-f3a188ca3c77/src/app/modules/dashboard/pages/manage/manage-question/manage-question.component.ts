import {Component, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {Question} from "../../../../../core/models/question.model";
import {Image} from "../../../../../core/models/image.model";
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {QuestionsService} from "../../../../../core/services/questions.service";
import {ToastrService} from "ngx-toastr";
import {ActivatedRoute, Router} from "@angular/router";
import {lastValueFrom} from "rxjs";
import {toast} from "ngx-sonner";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {MatOption} from "@angular/material/core";
import {MatSelect} from "@angular/material/select";
import {CoursesService} from "../../../../../core/services/courses.service";
import {Course} from "../../../../../core/models/course.entity";

@Component({
  selector: 'app-manage-question',
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    NgClass,
    MatOption,
    MatSelect,
    NgForOf
  ],
  templateUrl: './manage-question.component.html',
  styleUrl: './manage-question.component.scss'
})
export class ManageQuestionComponent implements OnInit {
  @ViewChild('actions', { static: true, read: ViewContainerRef })
  actions!: ViewContainerRef;
  type!: string | null
  questionId!: string | null
  sectionId!: string | null
  courseId!: string | null
  selectedCourse!: Course | undefined
  selectedSection!: string
  question!: Question
  courses: Course[] = [];
  selectedImage!: Image | undefined
  selectedType!: string
  manageQuestionForm!: FormGroup;
  isLoading = false
  submitted = false
  isMultiple = false
  showOptionC = false
  showOptionD = false
  questionTypes = [
    { value: 'VF', label: 'Vrai ou Faux' },
    { value: 'CM', label: 'Choix Multiple' },
    { value: 'CU', label: 'Choix Unique' },
  ]

  constructor(private coursesService: CoursesService, private fb : FormBuilder, private questionsService: QuestionsService, private toastr: ToastrService, private router: Router, private route: ActivatedRoute) {}
  async ngOnInit() {
    const result$ = this.coursesService.getAllCourses({ column: 'createdAt', direction: 'desc' }, 50, 0 , '', '', 'sections')
    const result = await lastValueFrom(result$);
    this.courses = result.data.courses

    this.type = this.route.snapshot.queryParamMap.get('type');
    this.questionId = this.route.snapshot.queryParamMap.get('questionId');

    this.sectionId = this.route.snapshot.queryParamMap.get('section');
    this.courseId = this.route.snapshot.queryParamMap.get('course');

    this.manageQuestionForm = this.fb.group({
      course:[null, Validators.required],
      section:[null, Validators.required],
      text: [null, Validators.required],
      topic: [null, [Validators.required]],
      points: [null, [Validators.required]],
      type: [null, [Validators.required]],
      answer: [null, [Validators.required]],
      details: [null, null],
      justification: [null, null],
    });
    if(this.type == 'add') {
      this.selectedCourse = this.courses.find(course => course.id === this.courseId);
      this.manageQuestionForm.get('course')!.disable();
      this.manageQuestionForm.get('section')!.disable();
      this.selectedSection = this.sectionId!
      this.manageQuestionForm.patchValue({
        course: this.courseId,
        section: this.sectionId,
      });
    }
    if (this.type == 'edit') {
      this.isLoading = true
      const result$ = this.questionsService.getQuestionDetails(this.questionId!)
      const result = await lastValueFrom(result$);
      this.question = result.data;
      this.selectedCourse = this.courses.find(course => course.id === this.question.quiz?.section?.course?.id);
      this.selectedSection = this.question.quiz?.section?.id!

      this.manageQuestionForm.get('course')!.disable();
      this.manageQuestionForm.get('section')!.disable();
      let newAnswer: any  = this.question.answer
      if(this.question.type == 'CM') {
        newAnswer = this.question.answer.split(',')
      }
      this.manageQuestionForm.patchValue({
        text: this.question.text,
        type: this.question.type,
        topic: this.question.topic,
        answer: newAnswer,
        points: this.question.points,
        details: this.question.details,
        justification: this.question.justification,
        course: this.question.quiz?.section?.course?.id,
        section: this.question.quiz?.section?.id,
      });
      this.selectedType = this.question.type
      switch (this.question.type) {
        case 'VF':
          this.manageQuestionForm.removeControl('a')
          this.manageQuestionForm.removeControl('b')
          this.manageQuestionForm.removeControl('c')
          this.manageQuestionForm.removeControl('d')
          break;
        case 'CM':
          this.isMultiple = true
          if(this.question.c) this.showOptionC = true
          if(this.question.d) this.showOptionD = true
          this.manageQuestionForm.addControl('a', new FormControl(this.question.a, Validators.required));
          this.manageQuestionForm.addControl('b', new FormControl(this.question.b, Validators.required));
          this.manageQuestionForm.addControl('c', new FormControl(this.question.c, null));
          this.manageQuestionForm.addControl('d', new FormControl(this.question.d, null));
          break;
        case 'CU':
          this.isMultiple = false
          if(this.question.c) this.showOptionC = true
          if(this.question.d) this.showOptionD = true
          this.manageQuestionForm.addControl('a', new FormControl(this.question.a, Validators.required));
          this.manageQuestionForm.addControl('b', new FormControl(this.question.b, Validators.required));
          this.manageQuestionForm.addControl('c', new FormControl(this.question.c, null));
          this.manageQuestionForm.addControl('d', new FormControl(this.question.d, null));
          break;
      }
      this.isLoading = false
    }

  }
  markAllAsTouched() {
    Object.keys(this.manageQuestionForm.controls).forEach((key) => {
      this.manageQuestionForm.get(key)?.markAsTouched();
    });
  }

  manageQuestion(){
    this.submitted = true;
    this.markAllAsTouched();
    if (this.manageQuestionForm.valid) {
      this.isLoading = true

      let data = {
        sectionId: this.selectedSection,
        text: this.manageQuestionForm.value.text,
        type: this.manageQuestionForm.value.type,
        topic: this.manageQuestionForm.value.topic,
        answer: this.manageQuestionForm.value.answer,
        points: this.manageQuestionForm.value.points,
        details: this.manageQuestionForm.value.details,
        justification: this.manageQuestionForm.value.justification,
        a: this.manageQuestionForm.value.a,
        b: this.manageQuestionForm.value.b,
        c: this.manageQuestionForm.value.c,
        d: this.manageQuestionForm.value.d,
      }

      if(this.type == 'add'|| this.type == 'new') {
        this.questionsService.addQuestion(data).subscribe({
          next: (result) => {
            if (result.status) {
              this.isLoading = false
              this.toastr.success('Question ajouté avec succès', 'Enregistré', { timeOut: 1500 });
              this.router.navigate([`/admin985xilinp/dashboard/courses/questions`]);
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
      if(this.type == 'edit') {
        this.questionsService.updateQuestion(this.question.id, data).subscribe({
          next: (result) => {
            if (result.status) {
              this.isLoading = false
              this.toastr.success('Question modifié avec succès', 'Enregistré', { timeOut: 1500 });
              this.router.navigate([`/admin985xilinp/dashboard/courses/questions`]);
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
  onSelectCourse($event: any) {
    this.selectedCourse = this.courses.find(course => course.id === $event.value);
  }
  onSelectSection($event: any) {
    this.selectedSection = $event.value
  }
  onSelectType($event: any) {
    this.manageQuestionForm.controls['answer'].setValue(null);
    this.selectedType = $event.value
    switch ($event.value) {
      case 'VF':
        this.manageQuestionForm.removeControl('a')
        this.manageQuestionForm.removeControl('b')
        this.manageQuestionForm.removeControl('c')
        this.manageQuestionForm.removeControl('d')
        break;
      case 'CM':
        this.isMultiple = true
        this.manageQuestionForm.addControl('a', new FormControl('', Validators.required));
        this.manageQuestionForm.addControl('b', new FormControl('', Validators.required));
        this.manageQuestionForm.addControl('c', new FormControl('', null));
        this.manageQuestionForm.addControl('d', new FormControl('', null));
        break;
      case 'CU':
        this.isMultiple = false
        this.manageQuestionForm.addControl('a', new FormControl('', Validators.required));
        this.manageQuestionForm.addControl('b', new FormControl('', Validators.required));
        this.manageQuestionForm.addControl('c', new FormControl('', null));
        this.manageQuestionForm.addControl('d', new FormControl('', null));
        break;
    }
  }
  bachToList() {
    this.router.navigate([`/admin985xilinp/dashboard/courses/questions`]);
  }
  fillInput($event: any, input: string) {
    if($event.target.value) {
      if(input == 'c') this.showOptionC = true
      if(input == 'd') this.showOptionD = true
    } else {
      if(input == 'c') this.showOptionC = false
      if(input == 'd') this.showOptionD = false
    }
  }
}
