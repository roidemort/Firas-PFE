import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertComponent } from '../alert/alert.component';
import { months } from '../../../../core/constants/months'
import { laboratoires } from 'src/app/core/constants/laboratories';

import { tableData } from '../../../../core/constants/data'
import { AuthService } from 'src/app/core/services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { LoadingService } from 'src/app/core/services/loading.service';
import { UsersService } from 'src/app/core/services/users.service';
import { roles } from '../../../../core/constants/roles';
import { catchError, forkJoin, map, of } from 'rxjs';
import { MainLoaderComponent } from "../loader/loader.component";

@Component({
  selector: 'app-my-team',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AlertComponent, FormsModule, RouterModule, MainLoaderComponent],
  templateUrl: './my-team.component.html',
  styleUrl: './my-team.component.scss'
})
export class MyTeamComponent {
  handleErrorResponse = false;
  handleResponse = false;
  handleError = false;
  alertMessage = '';
  // isLaboratoryOpen = false
  isMonthOpen = false
  filterForm: FormGroup
  months = months
  sortOuiz = true
  sortCours = true
  filterLaboratories = laboratoires
  // team = tableData
  roles = roles;
  selectAll: boolean = false;
  currentUser: any
  checkedMembers: Set<number> = new Set();
  myTeam: any
  TeamDetails: any
  count = 0
  maxUsers = 0
  isFilter = false
  isLoading = false

  // Add member modal
  showAddModal = false;
  addMemberForm: FormGroup;
  teamLimits: any = null;
  isSubmitting = false;
  addMemberMessage = '';
  addMemberSuccess = false;
  constructor(private fb: FormBuilder, private authService: AuthService, public loadingService: LoadingService, private userService: UsersService, private router: Router) {
    this.filterForm = this.fb.group({
      month: ['0'],
    });
    this.addMemberForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      role: ['', Validators.required],
    });
  }
  ngOnInit() {
    this.isLoading = true
    this.currentUser = this.authService.getUser()
    this.loadingService.setTab('mon-equipe');
    this.getMyTeam();
    this.loadTeamLimits();
  }

  getMyPlanDetails() {
    this.userService.getMyPlanDetails().subscribe({
      next: (res) => {
        if (res.status) {
          this.TeamDetails = res.data.subscription
          this.TeamDetails.users = this.sortMembers(this.TeamDetails)
          this.maxUsers = this.TeamDetails.usersNumber
          this.disabledForm()
          this.selectAll = this.areAllMembersSubscribed();
          this.TeamDetails.users.forEach((user: any) => {
            this.checkMember(user);
          });
          setTimeout(() => {
            this.isLoading = false
          }, 300);
        } else {
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error(error)
        this.isLoading = false;
      }
    });
  }

  getMyTeam() {
    this.userService.getMyTeam().subscribe({
      next: (res) => {
        if (res.status) {
          this.myTeam = this.sortMembers(res.data)
          this.getMyPlanDetails()
          this.count = res.data.count
          // console.log('myTeam',this.myTeam)
        } else {
          this.isLoading = false
        }
      },
      error: (error) => {
        console.error(error)
      }
    });
  }

  checkMember(membre: any): void {
    if (this.checkedMembers.has(membre.id)) return;
    this.checkedMembers.add(membre.id);

    const userIndex = this.myTeam.findIndex((user: { id: string }) => user.id === membre.id);

    if (userIndex > -1) {
      this.myTeam.push(...this.myTeam.splice(userIndex, 1));
    }
  }

  getRoleDisplayName(role: string): string {
    return this.roles[role.toUpperCase()] || role;
  }

  showAlert(alertType: 'handleResponse' | 'handleError' | 'handleErrorResponse') {
    const messages: { [key: string]: string } = {
      handleResponse: 'Membres récupéré avec succès.',
      handleErrorResponse: 'Aucun membre trouvé.',
      handleError: 'Une erreur s\'est produite.'
    };

    this[alertType] = true;
    this.alertMessage = messages[alertType];

    setTimeout(() => {
      this[alertType] = false;
      this.alertMessage = '';
    }, 3000);
  }

  // toggleAll(): void {
  //   if (this.selectAll) {
  //       const remainingSlots = this.maxUsers - this.checkedMembers.size;
  //       this.myTeam.forEach((membre: any) => {
  //           if (!this.checkedMembers.has(membre.id) && remainingSlots > 0) {
  //               this.checkedMembers.add(membre.id);
  //           }
  //       });
  //   } else {
  //       this.checkedMembers.forEach((id: any) => {
  //           if (!this.TeamDetails?.users.some((user: any) => user.id === id)) {
  //               this.checkedMembers.delete(id);
  //           }
  //       });
  //   }
  //   this.updateSelectAllState();
  // }

  toggleAll(): void {
    if (this.selectAll) {
      // Calculer les emplacements restants
      const remainingSlots = this.maxUsers - this.checkedMembers.size;

      // Ajouter les membres au checkedMembers jusqu'à atteindre la limite
      let addedCount = 0;
      this.myTeam.forEach((membre: any) => {
        if (!this.checkedMembers.has(membre.id) && addedCount < remainingSlots) {
          this.checkedMembers.add(membre.id);
          addedCount++;
        }
      });
    } else {
      // Retirer les membres qui ne font pas partie des TeamDetails
      this.checkedMembers.forEach((id: any) => {
        if (!this.TeamDetails?.users.some((user: any) => user.id === id)) {
          this.checkedMembers.delete(id);
        }
      });
    }

    // Mettre à jour l'état du bouton "Select All"
    this.updateSelectAllState();
  }

  toggleMembre(membre: any): void {
    if (this.checkedMembers.has(membre.id)) {
      if (!this.TeamDetails.users.some((user: any) => user.id === membre.id)) {
        this.checkedMembers.delete(membre.id);
      }
    } else {
      if (this.checkedMembers.size < this.maxUsers) {
        this.checkedMembers.add(membre.id);
      }
    }
    this.updateSelectAll();
  }

  updateSelectAll() {
    this.selectAll = this.myTeam.length > 0 && this.myTeam.every((membre: any) => this.checkedMembers.has(membre.id));
  }

  updateSelectAllState(): void {
    const totalChecked = this.checkedMembers.size;
    const subscribedCount = this.TeamDetails?.users?.length || 0;

    this.selectAll = totalChecked >= this.maxUsers || subscribedCount >= this.maxUsers;
  }

  isChecked(membre: any): boolean {
    return this.checkedMembers.has(membre.id);
  }

  sortMembers(members: any): any {
    // const sortedUsers = res.data.users.sort((a: { role: string; }, b: { role: any; }) => a.role.localeCompare(b.role));
    const sortedUsers = members.users.filter((user: { role: string; }) => user.role !== "PHARMACIST_HOLDER")
      .sort((a: { role: string; }, b: { role: any; }) => a.role
        .localeCompare(b.role));
    return sortedUsers
  }

  sortByQuiz() {
    this.sortOuiz = !this.sortOuiz
    if (this.sortOuiz) {
      this.myTeam = [...this.myTeam].sort((a, b) => a.scoreQuiz - b.scoreQuiz);
    } else {
      this.myTeam = [...this.myTeam].sort((a, b) => b.scoreQuiz - a.scoreQuiz);
    }
  }

  sortByCours() {
    this.sortCours = !this.sortCours
    if (this.sortCours) {
      this.myTeam = [...this.myTeam].sort((a, b) => a.numberCourses - b.numberCourses);
    } else {
      this.myTeam = [...this.myTeam].sort((a, b) => b.numberCourses - a.numberCourses);
    }
  }

  disabledForm() {
    if (this.maxUsers == 1) {
      this.filterForm.get('month')?.disable();
      // this.filterForm.get('laboratory')?.disable();
    }
  }

  resetFilter() {
    this.isFilter = false
    this.filterForm.patchValue({
      month: '0',
      // laboratory: '0',
    })
    if (this.count == 0) {
      this.getMyTeam();
    }
  }

  onSubmit() {
    this.isLoading = true
    const { month } = this.filterForm.value
    this.isFilter = true
    this.userService.getMyTeamByMonth(month).subscribe({
      next: (res) => {
        if (res.status && res.data.users) {
          this.sortMembers(res.data)
          this.count = res.data.count
          //console.log('myTeam on submit',this.myTeam)
          this.getMyTeam();
          this.isLoading = false
          this.showAlert('handleResponse');
        } else {
          setTimeout(() => {
            this.isLoading = false
          }, 100);
          this.count = 0
          this.showAlert('handleErrorResponse');
        }
      },
      error: (error) => {
        this.showAlert('handleError');
        console.error(error)
      }
    });
  }

  getAllMembresSubscribed(): boolean {
    return this.TeamDetails?.users.length != 0
  }

  isMaxUsersReached(): boolean {
    return this.checkedMembers.size >= this.maxUsers;
  }

  hasSubscription(membre: any): boolean {
    return this.TeamDetails?.users.some((user: any) => user.id === membre.id)
  }

  areAllMembersSubscribed(): boolean {
    const subscribedCount = this.TeamDetails?.users?.length;
    const totalChecked = this.checkedMembers.size;
    return totalChecked >= this.maxUsers || subscribedCount >= this.maxUsers;
  }

  areAllMembers(): boolean {
    const subscribedCount = this.TeamDetails?.users?.length;
    const totalTeam = this.myTeam?.length;
    return totalTeam == subscribedCount;
  }

  canShowAddButton(): boolean {
    const subscribedCount = this.TeamDetails?.users?.length;
    return this.checkedMembers.size > subscribedCount;
    // return this.checkedMembers.size > this.TeamDetails?.users?.length
  }

  isMaxUsersSubscribed(): boolean {
    return this.maxUsers === this.TeamDetails?.users?.length;
  }

  goToSubscription() {
    this.loadingService.setTab('gestion-abonnements')
    this.router.navigate(['/profil/gestion-abonnements'])
  }

  viewMembre(id: string) {
    // this.loadingService.setTab('parcours-apprentissage');
    // this.loadingService.setMenu(id);
  }

  addMembers(): void {
    this.isLoading = true;

    // Filtrer les nouveaux membres
    const newMembers = Array.from(this.checkedMembers).filter(
      (id) => !this.TeamDetails?.users.some((user: any) => user.id === id)
    );

    if (newMembers.length === 0) {
      this.isLoading = false;
      this.showAlert('handleResponse');
      return;
    }

    // Préparer les données pour l'API
    const data = {
      subscribeId: this.TeamDetails.id,
      users: newMembers, // Envoyer les IDs des utilisateurs dans un tableau
    };

    this.userService.addUsersToSubscription(data).subscribe({
      next: (response: any) => {
        // console.log('Tous les utilisateurs ont été ajoutés avec succès.', response);
      },
      error: (error) => {
        this.isLoading = false;
        this.showAlert('handleError');
        console.error('Erreur lors de l’ajout des utilisateurs:', error);
      },
      complete: () => {
        this.getMyTeam(); // Synchroniser l'équipe après ajout
        this.isLoading = false;
        this.showAlert('handleResponse');
      },
    });
  }

  getRoundedScore(score: number): number {
    return Math.floor(score);
  }

  // Team limits and add member modal
  loadTeamLimits() {
    this.userService.getTeamLimits().subscribe({
      next: (res) => {
        if (res.status) {
          this.teamLimits = res.data;
        }
      },
      error: (error) => {
        console.error('Error loading team limits:', error);
      }
    });
  }

  openAddModal() {
    this.addMemberForm.reset();
    this.addMemberMessage = '';
    this.addMemberSuccess = false;
    this.showAddModal = true;
  }

  closeAddModal() {
    this.showAddModal = false;
    this.addMemberForm.reset();
    this.addMemberMessage = '';
  }

  canAddRole(role: string): boolean {
    if (!this.teamLimits) return false;
    if (role === 'PHARMACIST') return this.teamLimits.pharmacists.remaining > 0;
    if (role === 'PREPARER') return this.teamLimits.preparers.remaining > 0;
    return false;
  }

  getRemainingSlots(role: string): number {
    if (!this.teamLimits) return 0;
    if (role === 'PHARMACIST') return this.teamLimits.pharmacists.remaining;
    if (role === 'PREPARER') return this.teamLimits.preparers.remaining;
    return 0;
  }

  canAddAnyMember(): boolean {
    if (!this.teamLimits) return false;
    return this.teamLimits.pharmacists.remaining > 0 || this.teamLimits.preparers.remaining > 0;
  }

  onAddMember() {
    if (this.addMemberForm.invalid || this.isSubmitting) return;

    this.isSubmitting = true;
    this.addMemberMessage = '';

    const formData = this.addMemberForm.value;
    this.userService.addTeamMember(formData).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (res.status) {
          this.addMemberSuccess = true;
          this.addMemberMessage = res.message;
          // Refresh team list and limits
          this.getMyTeam();
          this.loadTeamLimits();
          // Close modal after 2 seconds
          setTimeout(() => {
            this.closeAddModal();
          }, 2000);
        } else {
          this.addMemberSuccess = false;
          this.addMemberMessage = res.message;
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        this.addMemberSuccess = false;
        this.addMemberMessage = 'Une erreur est survenue.';
        console.error('Error adding team member:', error);
      }
    });
  }
}
