import { Component, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { ProfileHeaderComponent } from '../../components/profile-header/profile-header.component';
import { ProfileSidebarComponent } from '../../components/profile-sidebar/profile-sidebar.component';
import { CommonModule } from '@angular/common';
import { MainLoaderComponent } from "../../components/loader/loader.component";
import { LoadingService } from 'src/app/core/services/loading.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, ProfileHeaderComponent, ProfileSidebarComponent, MainLoaderComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  @ViewChild(ProfileHeaderComponent) profileHeaderComponent!: ProfileHeaderComponent;
  isSidebarExpanded: boolean = true
  isMobileSidebarExpanded: boolean = false
  isLoading = true
  // selectedTab = 'informations'
  isAuthenticated = this.authService.isAuthenticated();
  user: any;
  constructor(private authService: AuthService, private router: Router, private loadingService: LoadingService) { 
  }

  ngOnInit(){
    this.loadingService.isLoading$.subscribe(isLoading => {
      this.isLoading = isLoading;
    });
    this.user = this.authService.getUser()
    if(this.user){
      this.isLoading = false
    } else {
      this.router.navigate(['/connexion']);
    }
  }


  logout() {
    this.authService.logout();
    this.router.navigateByUrl('/');
  }

  onToggleSidebar(event: boolean) {
      this.isSidebarExpanded = event;
  }

  onToggleMobileSidebar(event: boolean) {
    this.isMobileSidebarExpanded = event;
}

  onSelectedTab(event: string) {
    this.router.navigate(['/profil/' + event]);
    if (this.profileHeaderComponent) {
      this.profileHeaderComponent.updateMobileMenu(false);
    }
    // this.selectedTab = event;
  }
}
