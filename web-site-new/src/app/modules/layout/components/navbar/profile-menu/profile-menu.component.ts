import {Component, OnInit} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {DatePipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {ClickOutsideDirective} from '../../../../../shared/directives/click-outside.directive';
import {AngularSvgIconModule} from 'angular-svg-icon';
import {ThemeService} from '../../../../../core/services/theme.service';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {AuthService} from "../../../../../core/services/auth.service";
import {UsersService} from "../../../../../core/services/users.service";
import {toast} from "ngx-sonner";
import {NotificationsService} from "../../../../../core/services/notifications.service";

@Component({
  selector: 'app-profile-menu',
  templateUrl: './profile-menu.component.html',
  styleUrls: ['./profile-menu.component.scss'],
  standalone: true,
  imports: [ClickOutsideDirective, NgClass, RouterLink, AngularSvgIconModule, DatePipe, NgForOf, NgIf],
  animations: [
    trigger('openClose', [
      state(
        'open',
        style({
          opacity: 1,
          transform: 'translateY(0)',
          visibility: 'visible',
        }),
      ),
      state(
        'closed',
        style({
          opacity: 0,
          transform: 'translateY(-20px)',
          visibility: 'hidden',
        }),
      ),
      transition('open => closed', [animate('0.2s')]),
      transition('closed => open', [animate('0.2s')]),
    ]),
  ],
})
export class ProfileMenuComponent implements OnInit {
  public isOpen = false;
  public isOpenNotification = false;
  public profileMenu = [
    {
      title: 'Votre Profil',
      icon: './assets/icons/heroicons/outline/user-circle.svg',
      link: '/admin985xilinp/dashboard/profile',
      clickFunction: null
    },
    {
      title: 'Paramètres',
      icon: './assets/icons/heroicons/outline/cog-6-tooth.svg',
      link: '/admin985xilinp/dashboard/settings',
      clickFunction: null
    },
    {
      title: 'Se déconnecter',
      icon: './assets/icons/heroicons/outline/logout.svg',
      link: null,
      clickFunction: this.logOut,
    },
  ];
  currentUser: any
  notifications: any
  count = 0
  visibleNotifications = 3; // Nombre initial de notifications visibles
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
  public themeColors = [
    {
      name: 'base',
      code: '#274848',
    },
    {
      name: 'yellow',
      code: '#f59e0b',
    },
    {
      name: 'green',
      code: '#22c55e',
    },
    {
      name: 'blue',
      code: '#3b82f6',
    },
    {
      name: 'orange',
      code: '#ea580c',
    },
    {
      name: 'red',
      code: '#cc0022',
    },
    {
      name: 'violet',
      code: '#6d28d9',
    },
  ];
  public themeMode = ['light', 'dark'];

  constructor(public themeService: ThemeService, private router: Router, private authService: AuthService, private usersService: UsersService, private notificationsService: NotificationsService) {}

  ngOnInit(): void {
    this.authService.currentUser.subscribe(userData => {
      this.currentUser = userData;
    });
    this.countMine()
    this.getMine()
  }
  showFullNotification(notification: any) {
    this.selectedNotification = notification;
    const words = notification.content.split('.');
    this.selectedNotification.content = words[0]
    this.selectedNotification.courseId = words[1]
    this.count -= 1
    this.getDetails(this.selectedNotification.id)
  }
  getTextFromHtml(html: string) {
    const div = document.createElement('div');
    const msg = html.split('"')
    div.innerHTML = msg[2]
    return div.innerHTML ||  '';
  }
  getUseName(html: string) {
    const div = document.createElement('div');
    const msg = html.split('"')
    div.innerHTML = msg[1]
    return div.innerHTML ||  '';
  }
  getCourseName(html: string) {
    const div = document.createElement('div');
    const msg = html.split('"')
    div.innerHTML = msg[3]
    return div.innerHTML ||  '';
  }
  goToUserDetails(userId: any) {
    this.router.navigate([`/admin985xilinp/dashboard/details-user/${userId}`]);
  }
  goToCourseDetails(courseId: string | undefined) {
    this.router.navigate([`/admin985xilinp/dashboard/courses/details-course/${courseId}`]);
  }
  loadMoreNotifications() {
    this.visibleNotifications += 3;
  }
  closeNotificationDetail() {
    this.selectedNotification = null;
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
  getDetails(id: string){
    this.notificationsService.getDetails(id).subscribe({
      next: (res) => {
        if (res.status) {
          this.getMine()
          //  console.log(res)
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
  getMine(){
    this.notificationsService.getMine().subscribe({
      next: (res) => {
        if (res.status) {
          this.notifications = res.data.notifications
        } else {
        }
      }, error: error => {
        console.error(error)
      }
    });
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
  public toggleMenu(): void {
    this.isOpen = !this.isOpen;
  }

  public toggleMenuNotification(): void {
    this.isOpenNotification = !this.isOpenNotification;
  }

  toggleThemeMode() {
    this.themeService.theme.update((theme) => {
      const mode = !this.themeService.isDark ? 'dark' : 'light';
      return { ...theme, mode: mode };
    });
  }

  toggleThemeColor(color: string) {
    this.themeService.theme.update((theme) => {
      return { ...theme, color: color };
    });
  }

  logOut() {
    this.authService.logout();
    this.router.navigateByUrl('/admin985xilinp/auth/sign-in');
  }
}
