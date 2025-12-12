import { Component } from '@angular/core';
import { roles } from '../../../../core/constants/roles';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from 'src/app/core/services/auth.service';
import { months } from '../../../../core/constants/months'
import { courses } from '../../../../core/constants/courses'

import { tabledata2 } from '../../../../core/constants/data'
import { AlertComponent } from '../alert/alert.component';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { LoadingService } from 'src/app/core/services/loading.service';
import { UsersService } from 'src/app/core/services/users.service';
import { MainLoaderComponent } from "../loader/loader.component";
@Component({
  selector: 'app-learning-journey',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AlertComponent, FormsModule, RouterModule, MainLoaderComponent],
  templateUrl: './learning-journey.component.html',
  styleUrl: './learning-journey.component.scss'
})
export class LearningJourneyComponent {
  user: any
  roles = roles;
  handleErrorResponse = false;
  handleResponse = false;
  handleError = false;
  alertMessage = '';
  // isCourseOpen = false
  sortOrder = true
  isMonthOpen = false
  filterForm: FormGroup
  months = months
  filterCourses = courses
  courses: any
  // team = tabledata2
  selectAll: boolean = false;
  currentUser: any
  checkedMembers: Set<number> = new Set();
  id: any
  isLoading = false
  courseProgressions: { [key: string]: any } = {};
  filteredCourses: any
  filteredEnrolls: any
  isFilter = false
  random: number
  loggedUser: any
  constructor(private fb: FormBuilder, private authService: AuthService, public loadingService: LoadingService, private route: ActivatedRoute, private userService: UsersService) {
    this.filterForm = this.fb.group({
      month: ['0'],
      // course: ['0'],
    });
    this.random = Math.floor(Math.random() * 11);

  }

  ngOnInit() {
    this.isLoading = true
    this.id = this.route.snapshot.paramMap.get('id')
    this.getUserDetails(this.id)
    // console.log(this.user)
    // console.log(this.loggedUser)
    this.loggedUser = this.authService.getUser();
    this.loadingService.setTab('parcours-apprentissage')
    this.loadingService.menuSubject$.subscribe(menu => {
      if (menu != '') {
        this.getUserDetails(menu)
        this.loadingService.setMenu('')
      }
    })
    //console.log(this.loggedUser)
    // this.showAlert('handleResponse');
  }

  async getUserDetails(id: string) {
    this.userService.getMyTeamDetails(id).subscribe({
      next: (res) => {
        if (res.status) {
          this.user = res.data.users
          this.courses = res.data.users.enrolls
          this.disabledForm(this.courses)
          this.sortCoursesByStartedAt(this.courses)
          this.getCoursProgrssion(this.courses)
          // console.log('getUserDetails',res.data)
          setTimeout(() => {
            this.isLoading = false
          }, 100);
        }else{
          this.user = this.loggedUser
          this.isLoading = false
        }
      },
      error: (error) => {
        console.error(error)
      }
    });
  }

  getProgression(coursId: string) {
    const data = {
      courseId: coursId,
      userId: this.user.id
    }
    this.userService.getProgression(data).subscribe({
      next: (res) => {
        if (res.status) {
          this.courseProgressions[coursId] = res.data.course;
          // console.log('getProgression',res.data)
        } else {
          this.isLoading = false
        }
      },
      error: (error) => {
        console.error(error)
      }
    });
  }


  getRoleDisplayName(role: string): string {
    return this.roles[role?.toUpperCase()] || role;
  }

  showAlert(alertType: 'handleResponse' | 'handleError' | 'handleErrorResponse') {
    const messages: { [key: string]: string } = {
      handleResponse: 'Cours récupéré avec succès.',
      handleErrorResponse: 'Aucun cours trouvé.',
      handleError: 'Une erreur s\'est produite.'
    };

    this[alertType] = true;
    this.alertMessage = messages[alertType];

    setTimeout(() => {
      this[alertType] = false;
      this.alertMessage = '';
    }, 1000);
  }

  // onSubmit() {
  //   console.log(this.filterForm.value)
  //   this.showAlert('handleResponse');
  // }

  // onSubmit() {
  //   this.isLoading = true
  //   const { month } = this.filterForm.value
  //   this.isFilter = true
  //   this.userService.getMyTeamByMonth(month).subscribe({
  //     next: (res) => {
  //       if (res.status && res.data.users) {
  //         // console.log(res.data)
  //         this.isLoading = false
  //         this.showAlert('handleResponse');
  //       } else {
  //         this.courses = [];
  //         setTimeout(() => {
  //           this.isLoading = false
  //         }, 100);
  //         this.showAlert('handleErrorResponse');
  //       }
  //     },
  //     error: (error) => {
  //       this.showAlert('handleError');
  //       console.error(error)
  //     }
  //   });
  // }


  async onSubmit() {
    this.isLoading = true;
    const { month } = this.filterForm.value;
    this.isFilter = true;
  
    // console.log("Mois sélectionné :", month);
    // console.log("Cours avant filtrage :", this.courses);
    // Faire une copie des données d'origine pour filtrer sans perte définitive
    const filteredEnrolls = this.user.enrolls.filter((course: { startedAt: string | number | Date; }) => {
      if (!course.startedAt) return false; // Exclure si `startedAt` est null
      const courseMonth = new Date(course.startedAt).getMonth() + 1; // Mois en 1-12
      return courseMonth === Number(month); // Comparaison avec `month` sélectionné
    });
  
    const filteredCourses = this.courses.filter((course: { startedAt: string | number | Date; }) => {
      if (!course.startedAt) return false;
      const courseMonth = new Date(course.startedAt).getMonth() + 1;
      return courseMonth === Number(month);
    });
    // console.log("Cours après filtrage :", filteredCourses);
  
    if (filteredCourses.length > 0 || filteredEnrolls.length > 0) {
      this.showAlert("handleResponse");
    } else {
      this.showAlert("handleErrorResponse");
    }
  
    // Ne pas modifier this.courses définitivement, seulement stocker les résultats filtrés temporairement
    this.filteredCourses = filteredCourses;
    this.filteredEnrolls = filteredEnrolls;
  
    this.isLoading = false;
  }
  
  

  resetFilter() {
    this.isFilter = false
    this.filterForm.patchValue({
      month: '0',
      // course: '0',
    })
    if (this.courses.length == 0) {
      this.getUserDetails(this.id);
    }
  }

  disabledForm(courses: any) {
    if (courses.length == 0) {
      this.filterForm.get('month')?.disable();
      this.filterForm.get('course')?.disable();
    }
  }

  sortCoursesByStartedAt(courses: any) {
    courses.sort((a: any, b: any) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  }

  getCoursProgrssion(courses: any) {
    courses.forEach((course: any) => {
      this.getProgression(course.id);
    });
  }

  sort() {
    this.sortOrder = !this.sortOrder
    if (this.sortOrder) {
      this.user.enrolls = [...this.user.enrolls].sort((a, b) => a.quizPoints - b.quizPoints);
    } else {
      this.user.enrolls = [...this.user.enrolls].sort((a, b) => b.quizPoints - a.quizPoints);
    }
  }


  getRoundedScore(score: number): number {
    return Math.floor(score);
  }

}
