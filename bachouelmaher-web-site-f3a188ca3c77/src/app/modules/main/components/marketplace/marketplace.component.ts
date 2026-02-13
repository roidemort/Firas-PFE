import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { UsersService } from 'src/app/core/services/users.service';

@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './marketplace.component.html',
  styleUrl: './marketplace.component.scss'
})
export class MarketplaceComponent {
 user: any;
  userStats: any = {
    totalPoints: 0,
    quizPoints: 0,
    completedCourses: 0,
    pharmacyName: ''
  };

  coins = 0; // Pièces pour le marketplace
  isLoading = true;
  showCoinRules = false;

  // Règles d'échange de points vers pièces
  coinExchangeRules = [
    "Une fois échangés de points vers pièces, aucun retour en arrière n'est possible",
    "Chaque laboratoire a sa propre monnaie de pièces spécifique",
    "Les cadeaux sont disponibles en quantité limitée (premier arrivé, premier servi)",
    "Après achat, les récompenses seront livrées directement à votre pharmacie",
    "Vous accumulez des points en terminant des formations et en réussissant des quiz"
  ];

  // Comment gagner des points
  pointsRules = [
    { title: 'Formations terminées', points: '+100 à +500 pts', description: 'Points variables selon la complexité de la formation' },
    { title: 'Quiz réussis', points: '+10 à +50 pts', description: 'Points bonus pour les scores élevés' },
    { title: 'Série de formations', points: '+200 pts', description: 'Bonus pour 5 formations terminées consécutivement' },
    { title: 'Parrainage', points: '+1000 pts', description: 'Pour chaque ami qui rejoint la plateforme' },
    { title: 'Participation quotidienne', points: '+10 pts/jour', description: 'Se connecter chaque jour rapporte des points' }
  ];

  constructor(
    private authService: AuthService,
    private userService: UsersService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();
    this.loadUserStats();
  }

  // Charger les statistiques de l'utilisateur (comme dans user-ranking)
  loadUserStats(): void {
    this.isLoading = true;

    this.userService.getAllRankings().subscribe({
      next: (res) => {
        if (res.status && res.data) {
          const data = res.data;

          // Mettre à jour les stats de l'utilisateur depuis le classement
          if (data.roleRanking?.userStats) {
            this.userStats = {
              ...this.userStats,
              totalPoints: data.roleRanking.userStats.totalPoints || 0,
              quizPoints: data.roleRanking.userStats.quizPoints || 0,
              completedCourses: data.roleRanking.userStats.completedCourses || 0,
              pharmacyName: data.roleRanking.userStats.pharmacyName || ''
            };
          }

          // Compléter depuis les stats générales si besoin
          if (data.stats) {
            this.userStats = {
              ...this.userStats,
              totalPoints: data.stats.totalPoints || this.userStats.totalPoints,
              quizPoints: data.stats.quizPoints || this.userStats.quizPoints,
              completedCourses: data.stats.completedCourses || this.userStats.completedCourses
            };
          }

          // Si pas de nom de pharmacie depuis roleRanking, essayer pharmacyRanking
          if (!this.userStats.pharmacyName && data.pharmacyRanking?.userStats) {
            this.userStats.pharmacyName = data.pharmacyRanking.userStats.pharmacyName || '';
          }
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des statistiques:', error);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  // Formater les points
  formatPoints(points: number): string {
    return points.toLocaleString('fr-FR');
  }

  // Toggle l'affichage des règles
  toggleCoinRules(): void {
    this.showCoinRules = !this.showCoinRules;
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
}
