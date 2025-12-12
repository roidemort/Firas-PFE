import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SvgIconComponent } from 'angular-svg-icon';
import { AuthService } from 'src/app/core/services/auth.service';
import { CoursesEventService } from 'src/app/core/services/courses-event.service';
import { CoursesService } from 'src/app/core/services/courses.service';
import { LocalStorageService } from 'src/app/core/services/localstorage.service';

@Component({
  selector: 'app-course-summary-card',
  standalone: true,
  imports: [RouterModule, CommonModule, SvgIconComponent],
  templateUrl: './course-summary-card.component.html',
  styleUrl: './course-summary-card.component.scss'
})
export class CourseSummaryCardComponent {
  @Input() cours!: any;
  @Output() showAlert = new EventEmitter<any>();
  currentUser!: { role: string };
  hasAccess: boolean = true;

  constructor(private router: Router, private authService: AuthService, private coursesService: CoursesService, private coursesEventService: CoursesEventService, private localStorageService: LocalStorageService){
  }

  ngOnInit(): void {
    // console.log(this.cours)
    // this.currentUser = this.authService.getUser();
    // console.log(this.currentUser)
    // this.hasAccess = this.cours.roles.includes(this.currentUser.role);
    // console.log(this.hasAccess)
    // this.hasAccess = this.checkAccess();
  }

  // private checkAccess(): boolean {
  //   return this.currentUser.role === 'PHARMACIST_HOLDER';
  // }

  startLearning(){
    this.coursesService.getEnrollCourse(this.cours.id).subscribe({
      next: (result) => {
        if(result.status){
          // this.coursesEventService.setEnrollCourse(result.data.EnrollCourse)
          localStorage.setItem('enrollCourse', JSON.stringify(result.data.EnrollCourse));
          //localStorage.setItem('enrollCourse', JSON.stringify(result.data.EnrollCourse));
          this.router.navigate(["/notre-plateforme/cours/apprentissage/" + this.cours.id])
        }else{
          this.showAlert.emit(true);
        }
      },
      error: (error) => {
        console.error(error)
      }  
    });
  }
  
}