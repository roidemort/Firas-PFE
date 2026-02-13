import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { forkJoin } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { LoadingService } from 'src/app/core/services/loading.service';
import { UsersService } from 'src/app/core/services/users.service';

@Component({
  selector: 'app-user-ranking',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-ranking.component.html',
  styleUrl: './user-ranking.component.scss'
})
export class UserRankingComponent {
user: any;
  isLoading = true;

  // Ranking data
  roleRanking: any[] = [];
  pharmacyRanking: any[] = [];

  // User's positions
  userRolePosition: number = 0;
  userPharmacyPosition: number = 0;
  totalUsersInRole: number = 0;
  totalUsersInPharmacy: number = 0;

  // User's stats
  userStats: any = {
    totalPoints: 0,
    quizPoints: 0,
    completedCourses: 0,
    pharmacyName: ''
  };

  // Current active tab
  activeTab: 'role' | 'pharmacy' = 'role';

  // Error handling
  hasError: boolean = false;
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private userService: UsersService,
    private loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();
    this.loadAllRankings();
  }

  // Charger tous les classements
  loadAllRankings(): void {
    this.isLoading = true;
    this.hasError = false;

    this.userService.getAllRankings().subscribe({
      next: (res) => {
        if (res.status && res.data) {
          const data = res.data;

          // Traiter le classement par rôle
          if (data.roleRanking) {
            this.roleRanking = this.processRankingData(data.roleRanking.ranking || []);
            this.userRolePosition = data.roleRanking.userPosition || 0;
            this.totalUsersInRole = data.roleRanking.totalUsers || 0;

            // Mettre à jour les stats de l'utilisateur
            if (data.roleRanking.userStats) {
              this.userStats = {
                ...this.userStats,
                totalPoints: data.roleRanking.userStats.totalPoints || 0,
                quizPoints: data.roleRanking.userStats.quizPoints || 0,
                completedCourses: data.roleRanking.userStats.completedCourses || 0,
                pharmacyName: data.roleRanking.userStats.pharmacyName || ''
              };
            }
          }

          // Traiter le classement par pharmacie
          if (data.pharmacyRanking) {
            this.pharmacyRanking = this.processRankingData(data.pharmacyRanking.ranking || []);
            this.userPharmacyPosition = data.pharmacyRanking.userPosition || 0;
            this.totalUsersInPharmacy = data.pharmacyRanking.totalUsers || 0;

            // Compléter les stats si manquantes
            if (data.pharmacyRanking.userStats && !this.userStats.pharmacyName) {
              this.userStats.pharmacyName = data.pharmacyRanking.userStats.pharmacyName || '';
            }
          }

          // Traiter les stats supplémentaires
          if (data.stats) {
            this.userStats = {
              ...this.userStats,
              totalPoints: data.stats.totalPoints || this.userStats.totalPoints,
              quizPoints: data.stats.quizPoints || this.userStats.quizPoints,
              completedCourses: data.stats.completedCourses || this.userStats.completedCourses
            };
          }
        } else {
          this.handleError('Données de classement non disponibles');
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des classements:', error);
        this.handleError('Impossible de charger les classements. Veuillez réessayer.');
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  // Traiter les données de classement
  processRankingData(ranking: any[]): any[] {
    return ranking.map(user => ({
      ...user,
      displayName: `${user.firstName} ${user.lastName}`,
      // S'assurer que les nombres sont bien des nombres
      totalPoints: Number(user.totalPoints) || 0,
      quizPoints: Number(user.quizPoints) || 0,
      completedCourses: Number(user.completedCourses) || 0,
      // Vérifier si c'est l'utilisateur courant
      isCurrentUser: user.id === this.user?.id
    }));
  }

  // Gestion des erreurs
  handleError(message: string): void {
    this.hasError = true;
    this.errorMessage = message;
    this.isLoading = false;

    // Réinitialiser les données en cas d'erreur
    this.roleRanking = [];
    this.pharmacyRanking = [];
    this.userRolePosition = 0;
    this.userPharmacyPosition = 0;
    this.totalUsersInRole = 0;
    this.totalUsersInPharmacy = 0;
  }

  // Changer d'onglet
  setActiveTab(tab: 'role' | 'pharmacy'): void {
    this.activeTab = tab;
  }

  // Obtenir le classement actuel
  getCurrentRanking(): any[] {
    return this.activeTab === 'role' ? this.roleRanking : this.pharmacyRanking;
  }

  // Obtenir la position actuelle de l'utilisateur
  getUserPosition(): number {
    return this.activeTab === 'role' ? this.userRolePosition : this.userPharmacyPosition;
  }

  // Obtenir le nombre total d'utilisateurs
  getTotalUsers(): number {
    return this.activeTab === 'role' ? this.totalUsersInRole : this.totalUsersInPharmacy;
  }

  // Calculer le pourcentage de position
  getPercentage(): string {
    const position = this.getUserPosition();
    const total = this.getTotalUsers();

    if (position === 0 || total === 0 || position > total) {
      return '0%';
    }

    // Calculer le pourcentage (plus la position est basse, meilleur c'est)
    const percentage = ((total - position + 1) / total) * 100;
    return percentage.toFixed(1) + '%';
  }

  // Obtenir le suffixe ordinal (1er, 2ème, etc.)
  getOrdinalSuffix(n: number): string {
    if (n === 0) return '';
    if (n === 1) return 'er';
    return 'ème';
  }

  // Obtenir l'emoji de médaille
  getMedalEmoji(position: number): string {
    switch (position) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '';
    }
  }

  // Obtenir le nom affiché du rôle
  getRoleDisplayName(role: string): string {
    const roles: { [key: string]: string } = {
      'PHARMACIST_HOLDER': 'Pharmacien Titulaire',
      'PHARMACIST_ASSISTANT': 'Assistant Pharmacien',
      'PHARMACIST': 'Pharmacien',
      'INTERN': 'Stagiaire',
      'STUDENT': 'Étudiant',
      'ADMIN': 'Administrateur',
      'SUPER_ADMIN': 'Super Administrateur'
    };
    return roles[role?.toUpperCase()] || role;
  }

  // Obtenir le nom de la pharmacie
  getPharmacyName(user: any): string {
    return user.pharmacyName || user.pharmacy?.name || 'Non spécifiée';
  }

  // Actualiser les données
  refreshRanking(): void {
    this.loadAllRankings();
  }

  // Vérifier si des données sont disponibles
  hasRankingData(): boolean {
    const currentRanking = this.getCurrentRanking();
    return currentRanking && currentRanking.length > 0;
  }

  // Obtenir le rang formaté (1er, 2ème, etc.)
  getFormattedRank(): string {
    const position = this.getUserPosition();
    if (position === 0) return 'Non classé';
    return `${position}${this.getOrdinalSuffix(position)}`;
  }

  // Formater les points
  formatPoints(points: number): string {
    return points.toLocaleString('fr-FR');
  }
}
