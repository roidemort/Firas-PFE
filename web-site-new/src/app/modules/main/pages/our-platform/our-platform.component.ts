import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { ProfileHeaderComponent } from "../../components/profile-header/profile-header.component";
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MainLoaderComponent } from '../../components/loader/loader.component';
import { CoursesSidebarComponent } from "../../components/courses-sidebar/courses-sidebar.component";
import { AuthService } from 'src/app/core/services/auth.service';
import { LoadingService } from 'src/app/core/services/loading.service';
import { LearningSidebarComponent } from "../../components/learning-sidebar/learning-sidebar.component";
import { LocalStorageService } from 'src/app/core/services/localstorage.service';
import { RestrictionService } from 'src/app/core/services/restriction.service';

@Component({
  selector: 'app-our-platform',
  standalone: true,
  imports: [CommonModule, RouterModule, ProfileHeaderComponent, MainLoaderComponent, CoursesSidebarComponent],
  templateUrl: './our-platform.component.html',
  styleUrl: './our-platform.component.scss'
})
export class OurPlatformComponent implements OnDestroy {
  @ViewChild('restrictedSection') restrictedSection!: ElementRef;
  isSidebarExpanded: boolean = true
  isMobileSidebarExpanded: boolean = false
  isLoading = false
  private readonly hiddenSidebarUrls: string[] = ['details-cours','avis','apprentissage','quiz','commentaire'];
  constructor(private restrictionService: RestrictionService, private authService: AuthService, private router: Router, private loadingService: LoadingService, private route: ActivatedRoute, private localStorageService: LocalStorageService) { 
  }
  ngOnDestroy(): void {
    localStorage.removeItem('enrollCourse');
    // console.log('LocalStorage cleared: enrollCourse');
  }
  ngOnInit(){
    // this.isLoading = true
  }

  ngAfterViewInit() {
    if (this.restrictedSection) {
      this.restrictionService.applyRestrictions(this.restrictedSection.nativeElement);
    }
  }

  onToggleSidebar(event: boolean) {
    this.isSidebarExpanded = event;
  }

  onToggleMobileSidebar(event: boolean) {
    this.isMobileSidebarExpanded = event;
  }

  dataRecived(event: any) {
  //  console.log(event)
  }

  showSidebar(): boolean {
    return !this.hiddenSidebarUrls.some(url => this.router.url.includes(url));
  }

  // showSidebar(): boolean {
  //   return !this.router.url.includes('details-cours') && !this.router.url.includes('avis') && !this.router.url.includes('apprentissage') && !this.router.url.includes('quiz');
  // }

  // showLearningSidebar(): boolean {
  //   return this.router.url.includes('apprentissage') || this.router.url.includes('quiz');
  // }
  
}
 
