import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RatingsService } from 'src/app/core/services/ratings.service';

@Component({
  selector: 'app-course-review',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './course-review.component.html',
  styleUrl: './course-review.component.scss'
})
export class CourseReviewComponent {
  @Input() coursId!: any;
  stars = [1, 2, 3, 4, 5];
  currentRating = 4;
  rating: any
  constructor(private ratingsService: RatingsService){

  }
  
  onStarClick(rating: number) {
    // this.currentRating = rating;
    // console.log(this.currentRating)
  }


  ngOnInit(){
    this.ratingsService.getAllActiveRatings(this.coursId).subscribe({
      next: (result) => {
        if(result.status){
          this.rating = result.data.ratings.shift()
          this.currentRating = this.rating?.rating
        }
      },
      error: (error) => {
        console.error(error)
      }  
    });
  }

}
