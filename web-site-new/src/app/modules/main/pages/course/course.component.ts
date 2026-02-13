import { Component } from '@angular/core';
import { LearningSidebarComponent } from "../../components/learning-sidebar/learning-sidebar.component";
import { LearningCourseComponent } from "../../components/learning-course/learning-course.component";
import { QuizComponent } from "../../components/quiz/quiz.component";
import { CoursFeedbackComponent } from "../../components/cours-feedback/cours-feedback.component";
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CoursesService } from 'src/app/core/services/courses.service';
import { Course } from 'src/app/core/models/course.entity';
import { MainLoaderComponent } from "../../components/loader/loader.component";
import { LoadingService } from 'src/app/core/services/loading.service';

@Component({
  selector: 'app-course',
  standalone: true,
  imports: [LearningSidebarComponent, LearningCourseComponent, QuizComponent, CoursFeedbackComponent, CommonModule, MainLoaderComponent],
  templateUrl: './course.component.html',
  styleUrl: './course.component.scss'
})
export class CourseComponent {
  isSidebarExpanded: boolean = true
  isMobileSidebarExpanded: boolean = false
  selectedTab: string = 'course';
  coursId: any
  cours: any
  isLoading = false

  constructor(private route: ActivatedRoute, private coursesService: CoursesService, private loadingService: LoadingService){
    this.loadingService.isMobileSidebarExpanded$.subscribe(status => {
      if(status != null){
       this.isMobileSidebarExpanded = !this.isMobileSidebarExpanded
      }
    })
  }

  ngOnInit(){
    this.isLoading = true
    this.coursId = this.route.snapshot.paramMap.get('id');
    this.loadCourseDetails(this.coursId);
  }

  loadCourseDetails(coursId: string) {
    this.coursesService.getActiveCourseDetails(coursId).subscribe({
      next: (result) => {
        if(result.status){
          this.cours = result.data;  
          this.isLoading = false;
        }
      },
      error: (error) => {  
        console.error(error);
      }
    });
  }
  
  dataRecived(event: any) {
    // console.log(event)
   }

  onTabSelected(tab: string) {
    this.selectedTab = tab;
  }
}
