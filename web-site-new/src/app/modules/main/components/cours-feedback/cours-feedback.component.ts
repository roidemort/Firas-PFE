import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Course } from 'src/app/core/models/course.entity';
import { RatingsService } from 'src/app/core/services/ratings.service';

interface Feedback {
  text: string;
  emoji: string;
}

@Component({
  selector: 'app-cours-feedback',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './cours-feedback.component.html',
  styleUrl: './cours-feedback.component.scss'
})
export class CoursFeedbackComponent {
  @Input() cours!: Course
  feedBackForm: FormGroup
  selectedFeedback: number | null = null;
  feedbackSent = false
  message = false
  ratingsMap = { 0: 1, 1: 2, 2: 3, 3: 4, 4: 5 };
  feedbackOptions: Feedback[] = [
    { text: 'Très mauvais', emoji: '😠' },
    { text: 'Moyen', emoji: '😕' },
    { text: 'Bien', emoji: '🙂' },
    { text: 'Très bien', emoji: '😃' },
    { text: 'Excellent', emoji: '🤩' },
  ];

  constructor(private fb: FormBuilder, private ratingService: RatingsService) {
    this.feedBackForm = this.fb.group({
      comment: [null],
    });

  }

  ngOnInit(){
    // console.log(this.cours.id)
  }

  selectFeedback(index: number): void {
    this.selectedFeedback = index;
    // console.log(this.selectedFeedback)
  }

  markAllAsTouched() {
    Object.keys(this.feedBackForm.controls).forEach(key => {
      this.feedBackForm.get(key)?.markAsTouched();
    });
  }

  onSubmit() {
    // this.markAllAsTouched();
    // stop here if form is invalid
    // if (this.feedBackForm.invalid) {
    //   return;
    // }
    const data = {
      courseId: this.cours.id,
      rating: this.selectedFeedback == 0 ? 1 : this.selectedFeedback == 1 ? 2 : this.selectedFeedback == 2 ? 3 : this.selectedFeedback == 3 ? 4 : this.selectedFeedback == 4 ? 5 : null,
      comment: this.feedBackForm.controls['comment'].value
    }
    // console.log(data)
    // console.log(this.feedBackForm.value, this.selectedFeedback)
    this.ratingService.addRating(data).subscribe({
      next: (result) => {
        if(result.status){
          // console.log(result)
          this.feedbackSent = true
        } else {
          this.message = true
        }
      },
      error: (error) => console.error(error),
    });
  }
}
