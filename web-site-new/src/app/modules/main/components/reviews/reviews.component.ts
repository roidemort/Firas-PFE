import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RatingsService } from 'src/app/core/services/ratings.service';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './reviews.component.html',
  styleUrl: './reviews.component.scss'
})
export class ReviewsComponent {
  coursId?: string | null;
  stars = [1, 2, 3, 4, 5];
  currentRating = 0;
  ratings: any

  constructor(private route: ActivatedRoute, private ratingsService: RatingsService){ }

  ngOnInit(){
    this.coursId = this.route.snapshot.paramMap.get('id');
    // console.log(this.coursId)
    if(this.coursId){
      this.ratingsService.getAllActiveRatings(this.coursId).subscribe({
        next: (result) => {
          if(result.status){
            this.ratings = result.data
            this.currentRating = this.ratings.averageRating
            // console.log(this.ratings)
          }
        },
        error: (error) => {
          console.error(error)
        }  
      });
    }
  }
}
