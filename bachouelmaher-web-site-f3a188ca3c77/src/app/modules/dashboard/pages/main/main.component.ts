import { Component, ElementRef, OnInit } from '@angular/core';
import { UsersService } from "../../../../core/services/users.service";
import { PharmaciesService } from "../../../../core/services/pharmacies.service";
import { CoursesService } from "../../../../core/services/courses.service";
import { toast } from "ngx-sonner";
import { DatePipe, CommonModule } from "@angular/common";
import { NgApexchartsModule } from 'ng-apexcharts';
import {
  ChartOptions,
  ChartOptionsBar,
  ChartOptionsCustom,
  ChartOptionsCustomPie
} from 'src/app/shared/models/chart-options';
import { FormsModule } from '@angular/forms';
import { SubscriptionsService } from 'src/app/core/services/subscription.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  standalone: true,
  imports: [
    NgApexchartsModule,
    CommonModule,
    FormsModule,
    DatePipe
  ],
  providers: [DatePipe]
})
export class MainComponent implements OnInit {
  // Dashboard Data
  newUsersData: any[] = [];
  newPharmaciesData: any[] = [];
  keyLifecycleData: any[] = [];
  paymentsData: any[] = [];
  coursesData: any[] = [];
  courseEngagementData: any = {};

  // Modal States
  showUsersModal: boolean = false;
  showPharmaciesModal: boolean = false;
  showKeysModal: boolean = false;
  showPaymentsModal: boolean = false;
  showCoursesModal: boolean = false;

  // Pagination
  currentUsersPage: number = 1;
  currentPharmaciesPage: number = 1;
  currentKeysPage: number = 1;
  currentPaymentsPage: number = 1;
  currentCoursesPage: number = 1;
  itemsPerPage: number = 10;

  // Show more states for tables on dashboard
  showAllKeys: boolean = false;
  showAllPayments: boolean = false;
  showAllUsers: boolean = false;
  showAllPharmacies: boolean = false;
  showAllCourses: boolean = false;

  // Course section expanded view
  coursesExpanded: boolean = false;

  // Filters
  usersDateFilter: '7days' | '30days' = '7days';
  pharmaciesDateFilter: '7days' | '30days' = '30days';

  // Loading States
  loadingUsers: boolean = false;
  loadingPharmacies: boolean = false;
  loadingKeys: boolean = false;
  loadingPayments: boolean = false;
  loadingCourses: boolean = false;

  readonly Math = Math;

  constructor(
    private usersService: UsersService,
    private pharmaciesService: PharmaciesService,
    private subscriptionsService: SubscriptionsService,
    private coursesService: CoursesService,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.calculateNewUsersData();
    this.calculateNewPharmaciesData();
    this.loadKeyLifecycleData();
    this.loadPaymentsData();
    this.loadCoursesData();
  }

  private calculateNewUsersData(): void {
    this.loadingUsers = true;
    this.usersService.getAllUsers({ column: 'createdAt', direction: 'desc' }, 100, 1).subscribe({
      next: (response) => {
        const users = response.data?.users || [];
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        this.newUsersData = users.filter((user: any) => {
          const userDate = new Date(user.createdAt);
          return userDate >= (this.usersDateFilter === '7days' ? sevenDaysAgo : thirtyDaysAgo);
        });

        this.loadingUsers = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.loadingUsers = false;
        this.handleRequestError(error, 'utilisateurs');
      }
    });
  }

  private calculateNewPharmaciesData(): void {
    this.loadingPharmacies = true;
    this.pharmaciesService.getAllPharmacies({ column: 'createdAt', direction: 'desc' }, 100, 1).subscribe({
      next: (response) => {
        const pharmacies = response.data?.pharmacies || [];
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        this.newPharmaciesData = pharmacies.filter((pharmacy: any) => {
          const pharmacyDate = new Date(pharmacy.createdAt);
          return pharmacyDate >= thirtyDaysAgo;
        });

        this.loadingPharmacies = false;
      },
      error: (error) => {
        console.error('Error loading pharmacies:', error);
        this.loadingPharmacies = false;
        this.handleRequestError(error, 'pharmacies');
      }
    });
  }

  private loadKeyLifecycleData(): void {
    this.loadingKeys = true;
    this.keyLifecycleData = [];

    this.pharmaciesService.getAllPharmacies({ column: 'name', direction: 'asc' }, 50, 1).subscribe({
      next: (pharmaciesResponse) => {
        const pharmacies = pharmaciesResponse.data?.pharmacies || [];

        if (pharmacies.length === 0) {
          this.loadingKeys = false;
          return;
        }

        let pharmacyKeysLoaded = 0;

        pharmacies.forEach((pharmacy: any) => {
          this.pharmaciesService.getAllKeys(
            { column: 'createdAt', direction: 'desc' },
            pharmacy.id,
            50,
            1
          ).subscribe({
            next: (keysResponse) => {
              const keys = keysResponse.data?.keys || [];

              keys.forEach((key: any) => {
                this.keyLifecycleData.push({
                  pharmacy: pharmacy.name,
                  role: key.role || 'N/A',
                  status: key.status === 3 ? 'used' : 'not-used',
                  usedBy: key.user ? `${key.user.firstName} ${key.user.lastName}` : '—',
                  date: key.updatedAt || '—',
                  rawStatus: key.status
                });
              });

              pharmacyKeysLoaded++;
              if (pharmacyKeysLoaded === pharmacies.length) {
                this.loadingKeys = false;
              }
            },
            error: (error) => {
              console.error('Error loading keys for pharmacy:', pharmacy.name, error);
              pharmacyKeysLoaded++;
              if (pharmacyKeysLoaded === pharmacies.length) {
                this.loadingKeys = false;
              }
            }
          });
        });
      },
      error: (error) => {
        console.error('Error loading pharmacies:', error);
        this.loadingKeys = false;
        this.handleRequestError(error, 'pharmacies pour les clés');
      }
    });
  }

  private loadPaymentsData(): void {
    this.loadingPayments = true;
    this.subscriptionsService.getAllSubscriptions(
      { column: 'createdAt', direction: 'desc' },
      50,
      1
    ).subscribe({
      next: (response) => {
        const subscriptions = response.data?.subscriptions || [];
        this.paymentsData = subscriptions.map((subscription: any) => {
          let buyerName = 'N/A';
          if (subscription.buyer) {
            const buyer = subscription.buyer;
            buyerName = `${buyer.firstName || ''} ${buyer.lastName || ''}`.trim();
            if (!buyerName && buyer.email) {
              buyerName = buyer.email;
            }
          }

          return {
            buyer: buyerName,
            plan: subscription.package?.name || 'N/A',
            status: this.getPaymentStatus(subscription),
            lastPayment: subscription.createdAt,
            rawStatus: subscription.status
          };
        });

        this.loadingPayments = false;
      },
      error: (error) => {
        console.error('Error loading payments:', error);
        this.loadingPayments = false;
        this.handleRequestError(error, 'paiements');
      }
    });
  }

  private getPaymentStatus(subscription: any): string {
    if (subscription.status === 1) return 'paid';
    if (subscription.endedAt) {
      const endDate = new Date(subscription.endedAt);
      const now = new Date();
      if (endDate < now) return 'overdue';
    }
    return 'overdue';
  }

  private loadCoursesData(): void {
    this.loadingCourses = true;
    this.coursesService.getAllCourses(
      { column: 'title', direction: 'asc' },
      100,
      1
    ).subscribe({
      next: (coursesResponse) => {
        const courses = coursesResponse.data?.courses || [];
        this.coursesData = courses.map((course: any) => {
          // Mock data - replace with actual API data
          const enrolled = Math.floor(Math.random() * 50) + 10;
          const completed = Math.floor(enrolled * (Math.random() * 0.4 + 0.3));
          const active = Math.floor(enrolled * (Math.random() * 0.3 + 0.4));

          return {
            id: course.id,
            title: course.title,
            category: course.category || 'Général',
            description: course.description || '',
            enrolled: enrolled,
            completed: completed,
            active: active,
            inactive: enrolled - active - completed,
            completionRate: enrolled > 0 ? Math.round((completed / enrolled) * 100) : 0,
            engagementRate: enrolled > 0 ? Math.round((active / enrolled) * 100) : 0,
            averageRating: (Math.random() * 2 + 3).toFixed(1), // 3.0 - 5.0
            lastActivity: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
          };
        });

        // Calculate global engagement
        const totalEnrolled = this.coursesData.reduce((sum, course) => sum + course.enrolled, 0);
        const totalActive = this.coursesData.reduce((sum, course) => sum + course.active, 0);
        const totalCompleted = this.coursesData.reduce((sum, course) => sum + course.completed, 0);

        this.courseEngagementData = {
          enrolled: totalEnrolled,
          completed: totalCompleted,
          active: totalActive,
          inactive: totalEnrolled - totalActive - totalCompleted,
          activePercentage: totalEnrolled > 0 ? Math.round((totalActive / totalEnrolled) * 100) : 0,
          completionPercentage: totalEnrolled > 0 ? Math.round((totalCompleted / totalEnrolled) * 100) : 0
        };

        // Sort by engagement rate
        this.coursesData.sort((a, b) => b.engagementRate - a.engagementRate);

        this.loadingCourses = false;
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.loadingCourses = false;
        this.handleRequestError(error, 'cours');
      }
    });
  }

  // Toggle methods
  toggleShowAllKeys(): void {
    this.showAllKeys = !this.showAllKeys;
  }

  toggleShowAllPayments(): void {
    this.showAllPayments = !this.showAllPayments;
  }

  toggleShowAllUsers(): void {
    this.showAllUsers = !this.showAllUsers;
  }

  toggleShowAllPharmacies(): void {
    this.showAllPharmacies = !this.showAllPharmacies;
  }

  toggleShowAllCourses(): void {
    this.showAllCourses = !this.showAllCourses;
  }

  toggleCoursesExpanded(): void {
    this.coursesExpanded = !this.coursesExpanded;
  }

  // Get displayed items
  get displayedKeys() {
    return this.showAllKeys ? this.keyLifecycleData : this.keyLifecycleData?.slice(0, 5);
  }

  get displayedPayments() {
    return this.showAllPayments ? this.paymentsData : this.paymentsData?.slice(0, 5);
  }

  get displayedUsers() {
    return this.showAllUsers ? this.newUsersData : this.newUsersData?.slice(0, 5);
  }

  get displayedPharmacies() {
    return this.showAllPharmacies ? this.newPharmaciesData : this.newPharmaciesData?.slice(0, 5);
  }

  get displayedCourses() {
    return this.showAllCourses ? this.coursesData : this.coursesData?.slice(0, 5);
  }

  // Scroll to section
  scrollToSection(sectionId: string): void {
    const element = this.elementRef.nativeElement.querySelector(`#${sectionId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Modal Control Methods
  openUsersModal(): void {
    this.showUsersModal = true;
  }

  openPharmaciesModal(): void {
    this.showPharmaciesModal = true;
  }

  openKeysModal(): void {
    this.showKeysModal = true;
  }

  openPaymentsModal(): void {
    this.showPaymentsModal = true;
  }

  openCoursesModal(): void {
    this.showCoursesModal = true;
  }

  closeModal(): void {
    this.showUsersModal = false;
    this.showPharmaciesModal = false;
    this.showKeysModal = false;
    this.showPaymentsModal = false;
    this.showCoursesModal = false;
  }

  onUsersDateFilterChange(): void {
    this.calculateNewUsersData();
  }

  // Pagination Methods
  get paginatedUsers() {
    const start = (this.currentUsersPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return (this.newUsersData || []).slice(start, end);
  }

  get paginatedPharmacies() {
    const start = (this.currentPharmaciesPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return (this.newPharmaciesData || []).slice(start, end);
  }

  get paginatedKeys() {
    const start = (this.currentKeysPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return (this.keyLifecycleData || []).slice(start, end);
  }

  get paginatedPayments() {
    const start = (this.currentPaymentsPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return (this.paymentsData || []).slice(start, end);
  }

  get paginatedCourses() {
    const start = (this.currentCoursesPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return (this.coursesData || []).slice(start, end);
  }

  nextPage(type: string): void {
    switch (type) {
      case 'users':
        if (this.currentUsersPage * this.itemsPerPage < (this.newUsersData?.length || 0)) {
          this.currentUsersPage++;
        }
        break;
      case 'pharmacies':
        if (this.currentPharmaciesPage * this.itemsPerPage < (this.newPharmaciesData?.length || 0)) {
          this.currentPharmaciesPage++;
        }
        break;
      case 'keys':
        if (this.currentKeysPage * this.itemsPerPage < (this.keyLifecycleData?.length || 0)) {
          this.currentKeysPage++;
        }
        break;
      case 'payments':
        if (this.currentPaymentsPage * this.itemsPerPage < (this.paymentsData?.length || 0)) {
          this.currentPaymentsPage++;
        }
        break;
      case 'courses':
        if (this.currentCoursesPage * this.itemsPerPage < (this.coursesData?.length || 0)) {
          this.currentCoursesPage++;
        }
        break;
    }
  }

  prevPage(type: string): void {
    switch (type) {
      case 'users':
        if (this.currentUsersPage > 1) {
          this.currentUsersPage--;
        }
        break;
      case 'pharmacies':
        if (this.currentPharmaciesPage > 1) {
          this.currentPharmaciesPage--;
        }
        break;
      case 'keys':
        if (this.currentKeysPage > 1) {
          this.currentKeysPage--;
        }
        break;
      case 'payments':
        if (this.currentPaymentsPage > 1) {
          this.currentPaymentsPage--;
        }
        break;
      case 'courses':
        if (this.currentCoursesPage > 1) {
          this.currentCoursesPage--;
        }
        break;
    }
  }

  private handleRequestError(error: any, context: string = '') {
    const msg = context ? `Erreur lors du chargement des ${context}` : 'Une erreur est survenue';
    toast.error(msg, {
      position: 'bottom-right',
      description: error.message || 'Veuillez réessayer',
      action: {
        label: 'Fermer',
        onClick: () => console.log('Fermer'),
      },
      actionButtonStyle: 'background-color:#DC2626; color:white;',
    });
  }

  get usedKeysCount(): number {
    return (this.keyLifecycleData || []).filter(k => k.rawStatus === 3).length;
  }

  get paidPaymentsCount(): number {
    return (this.paymentsData || []).filter(p => p.rawStatus === 1).length;
  }

  get overduePaymentsCount(): number {
    return (this.paymentsData || []).filter(p => p.rawStatus !== 1).length;
  }

  get topEngagedCourses() {
    return this.coursesData
      .sort((a, b) => b.engagementRate - a.engagementRate)
      .slice(0, 5);
  }

  get topCompletedCourses() {
    return this.coursesData
      .sort((a, b) => b.completionRate - a.completionRate)
      .slice(0, 5);
  }
}
