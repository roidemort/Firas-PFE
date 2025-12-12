import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Output } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SvgIconComponent } from 'angular-svg-icon';
import { AuthService } from 'src/app/core/services/auth.service';
import { CoursesEventService } from 'src/app/core/services/courses-event.service';
import { LoadingService } from 'src/app/core/services/loading.service';
import { NotificationsService } from 'src/app/core/services/notifications.service';
import { SidebarService } from 'src/app/core/services/sidebar.service';
import { UsersService } from 'src/app/core/services/users.service';

@Component({
  selector: 'app-profile-header',
  standalone: true,
  imports: [CommonModule, RouterModule, SvgIconComponent],
  templateUrl: './profile-header.component.html',
  styleUrl: './profile-header.component.scss'
})
export class ProfileHeaderComponent {
  @Output() opnedMenu = new EventEmitter<any>();
  @Output() opnedMobileMenu = new EventEmitter<any>();
  menu = true
  img_link : any = null
  mobileMenu = false
  showMenu = false
  showNotificationMenu = false
  currentUser: any;
  random: number
  notifications: any
  count = 0 
  visibleNotifications = 1; // Nombre initial de notifications visibles
  selectedNotification: any = null;
  iconPaths: { [key: string]: string } = {
    email: 'assets/images/mail.svg',
    notification: 'assets/images/notif.svg',
    message: 'assets/images/message-icon.svg'
  };
  showText: any = {
    email: {
      title: 'Nouveau courrier reçu',
      message: 'Vous avez reçu un nouvel email.'
    },
    notification: {
      title: 'Nouvelle notification reçue',
      message: 'Vous avez une nouvelle notification.'
    },
    message: {
      title: 'Nouveau message reçu',
      message: 'Vous avez un nouveau message.'
    }
  };
  constructor(private loadingService: LoadingService, private sidebarService: SidebarService, private authService: AuthService, private router: Router,private userService: UsersService, private coursesEventService: CoursesEventService, private notificationsService: NotificationsService) {
      this.userService.userUpdate$.subscribe(link => {
       this.img_link = link
       //this.currentUser = this.authService.getUser()
       //console.log( this.currentUser)
      });
      this.random = Math.floor(Math.random() * 11);

  }

  ngOnInit(){
    this.toggleSidebarMobile()
    this.countMine()
    this.getMine()
    this.currentUser = this.authService.getUser()
    this.loadingService.mobileMenuSubject$.subscribe((status) => {
        this.toggleSidebarMobile()
    });
  }

  loadMoreNotifications() {
    this.visibleNotifications += 3;
  }

  showFullNotification(notification: any) {
    this.selectedNotification = notification;
    this.getDetails(this.selectedNotification.id)
  }

  closeNotificationDetail() {
    this.selectedNotification = null;
  }

  getDetails(id: string){
    this.notificationsService.getDetails(id).subscribe({
      next: (res) => {
        if (res.status) {
          this.countMine()
          this.getMine()
        //  console.log(res)
        } else {
        }
      }, error: error => {
        console.error(error)
      }
    });
  }

  getMine(){
    this.notificationsService.getMine().subscribe({
      next: (res) => {
        if (res.status) {
          //  console.log(res.data)
          // this.notifications = res.data.notifications
          // this.notifications = res.data.notifications.sort((a: { status: number; }, b: { status: number; }) => {
          //   return b.status - a.status;
          // });
          this.notifications = res.data.notifications.filter((notification: { status: number }) => notification.status === 1);
        } else {
        }
      }, error: error => {
        console.error(error)
      }
    });
  }

  countMine(){
    this.notificationsService.countMine().subscribe({
      next: (res) => {
        if (res.status) {
         // console.log(res.data)
          this.count = res.data
        } else {
        }
      }, error: error => {
        console.error(error)
      }
    });
  }

  toggleMenu() {
    this.showMenu = !this.showMenu;
  }

  toggleNotificationMenu() {
    this.showNotificationMenu = !this.showNotificationMenu;
    this.visibleNotifications = 3; 
  }

  handleIconClick() {
    this.hideMenu();
  }

  handleNotificationIconClick() {
    this.hideNotificationMenu();
  }

  hideNotificationMenu() {
    this.showNotificationMenu = false;
    this.selectedNotification = null
  }

  hideMenu() {
    this.showMenu = false;
  }

  @HostListener('document:click', ['$event'])
  onClick(event: Event) {
    const target = event.target as HTMLElement;

    if (!target.closest('.menu-container') && !target.closest('.avatar-icon')) {
      this.hideMenu();
      this.hideNotificationMenu();
    }
  }

  toggleSidebar() {
    this.menu = !this.menu;
    this.coursesEventService.setSidebarExpanded(this.menu)
    this.sidebarService.toggleSidebar();
    this.opnedMenu.emit(this.menu);
  }

  toggleSidebarMobile(){
    this.mobileMenu = !this.mobileMenu;
    this.opnedMobileMenu.emit(this.mobileMenu);
    this.loadingService.setMobileSidebarExpanded(true)
  }

  logout(){
    this.showMenu = false
    this.authService.logout()
    this.router.navigateByUrl('/')
  }

  goToProfile(){
    this.router.navigate(['/profil'])
  }

  updateMobileMenu(state: boolean) {
    this.mobileMenu = state;
    this.opnedMobileMenu.emit(this.mobileMenu);
  }

  getTimeDifference(createdAt: string): string {
    const createdDate = new Date(createdAt);
    const now = new Date();
    const differenceInSeconds = Math.floor((now.getTime() - createdDate.getTime()) / 1000);

    // Définir les unités de temps
    const secondsInMinute = 60;
    const secondsInHour = 3600;
    const secondsInDay = 86400;

    if (differenceInSeconds < secondsInMinute) {
      return `il y a ${differenceInSeconds} secondes`;
    } else if (differenceInSeconds < secondsInHour) {
      const minutes = Math.floor(differenceInSeconds / secondsInMinute);
      return `il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else if (differenceInSeconds < secondsInDay) {
      const hours = Math.floor(differenceInSeconds / secondsInHour);
      return `il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    } else {
      const days = Math.floor(differenceInSeconds / secondsInDay);
      return `il y a ${days} jour${days > 1 ? 's' : ''}`;
    }
  }

  getTextFromHtml(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }
  

}
