import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/core/services/auth.service';
import { LoadingService } from 'src/app/core/services/loading.service';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-profile-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile-sidebar.component.html',
  styleUrl: './profile-sidebar.component.scss'
})
export class ProfileSidebarComponent {
  @Input() menu!: boolean;
  @Input() mobileMenu!: boolean;
  @Output() tab = new EventEmitter<any>();
  showContent = true
  selectedTab: string = 'information';
  user: any;
  selectedItem = ''
  filteredMenuItems: any;
  id: any
  menuItems = [
    { tab: 'details', icon: 'edit-00', icon_active: 'edit-01', alt: 'edit-01', label: 'Informations personnelles' },
    { tab: 'mon-equipe', icon: 'user-group-00', icon_active: 'user-group-01', alt: 'user-group-01', label: 'Mon équipe' },
    { tab: 'parcours-apprentissage', icon: 'flask-00', icon_active: 'flask-01', alt: 'flask-01', label: 'Mon parcours d\'apprentissage' },
    { tab: 'classement', icon: 'medal-00', icon_active: 'medal', alt: 'trophy', label: 'Classement' },
    { tab: 'marketplace', icon: 'medal-00', icon_active: 'medal', alt: 'trophy', label: 'Marketplace' },
    { tab: 'confidentialite-securite', icon: 'shield', icon_active: 'shield-01', alt: 'shield', label: 'Confidentialité et sécurité' },
    { tab: 'gestion-abonnements', icon: 'desktop', icon_active: 'desktop-01', alt: 'desktop', label: 'Gestion des abonnements' },
    { tab: 'aide', icon: 'help', alt: 'help', icon_active: 'help', label: 'Demander de l\'aide' },
  ];

  constructor(private authService: AuthService, private loadingService: LoadingService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id')
    this.user = this.authService.getUser()

    this.loadingService.tabSelected$.subscribe(tab => {
      if ((tab == 'mon-equipe'))
        this.selectedItem = tab;
    });


    this.getSelectedItem()
    this.filteredMenuItems = this.menuItems.filter(item => {
      if (item.tab === 'mon-equipe' || item.tab === 'gestion-abonnements') {
        return this.user.role === 'PHARMACIST_HOLDER';
      }
      return true;
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.menu) {
      setTimeout(() => {
        this.showContent = this.menu
      }, 160);
    } else {
      this.showContent = false
    }
  }

  // selectTab(tab: string): void {
  //   this.mobileMenu = !this.mobileMenu
  //   if(tab !== 'aide'){
  //     this.selectedTab = tab;
  //     this.selectedItem = tab;
  //     this.tab.emit(this.selectedTab);
  //   }
  // }

  //   selectTab(tab: string): void {
  //   this.mobileMenu = !this.mobileMenu;
  //   if (tab === 'aide') return;
  //   this.selectedItem = tab;
  //   this.selectedTab = (tab === 'parcours-apprentissage') ? `${tab}/${this.user.id}` : tab;
  //   // if (this.selectedTab.includes(this.selectedItem) && tab === 'parcours-apprentissage') return;

  //   this.tab.emit(this.selectedTab);
  // }

  selectTab(tab: string): void {
    this.mobileMenu = !this.mobileMenu
    if (tab !== 'aide') {
      this.selectedItem = tab;
      if (tab === 'parcours-apprentissage') {
        this.selectedItem = tab;
        this.selectedTab = tab + '/' + this.user.id;
        this.loadingService.setMenu(this.user.id)
        this.tab.emit(this.selectedTab);
      } else {
        this.selectedItem = tab;
        this.selectedTab = tab
        this.tab.emit(this.selectedTab);
      }
    }
  }

  getSelectedItem() {
    const fullUrl = window.location.href;
    const segments = fullUrl.split('/');
    this.selectedItem = segments[segments.length - 1];
  }
}
