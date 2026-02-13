import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-payment-failed',
  standalone: true,
  imports: [CommonModule],
   template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div class="max-w-md w-full text-center">
        <div class="mb-6">
          <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <svg class="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </div>
        </div>

        <h1 class="text-3xl font-bold text-gray-900 mb-2">Paiement Échoué</h1>
        <p class="text-gray-600 mb-4">Votre paiement n'a pas pu être traité.</p>

        <div *ngIf="errorMessage" class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
          {{ errorMessage }}
        </div>

        <div *ngIf="transactionId" class="bg-gray-100 p-4 rounded-lg mb-6">
          <p class="text-sm text-gray-500">ID de transaction</p>
          <p class="font-mono text-gray-800 break-all">{{ transactionId }}</p>
        </div>

        <div class="space-y-3">
          <button (click)="retryPayment()"
                  class="w-full bg-[#23BAC4] hover:bg-[#1B9198] text-white font-medium py-3 px-6 rounded-lg transition duration-300">
            Réessayer le paiement
          </button>

          <button (click)="contactSupport()"
                  class="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-lg transition duration-300">
            Contacter le support
          </button>
        </div>

        <!-- Auto-redirect to mobile app -->
        <p class="text-sm text-gray-400 mt-6">
          Redirection automatique vers l'application...
        </p>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class PaymentFailedComponent {
transactionId: string = '';
  errorCode: string = '';
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    // Get error details from URL
    this.route.queryParams.subscribe(params => {
      this.transactionId = params['tid'] || params['TransactionId'] || params['transaction'] || '';
      this.errorCode = params['errorCode'] || params['ResponseCode'] || params['error_code'] || '';

      // Map error codes to user-friendly messages
      this.errorMessage = this.getErrorMessage(this.errorCode);

      console.log('Payment failed - Transaction:', this.transactionId, 'Error:', this.errorCode);
    });

    // Auto-redirect to mobile app after 3 seconds
    setTimeout(() => {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isMobile) {
        window.location.href = `galiocare://payment/failed?tid=${this.transactionId}&error=${this.errorCode}`;
      }
    }, 3000);
  }

  getErrorMessage(code: string): string {
    const errors: { [key: string]: string } = {
      '01': 'Carte expirée',
      '02': 'Fonds insuffisants',
      '03': 'Transaction refusée par la banque',
      '05': 'Veuillez réessayer',
      '12': 'Transaction invalide',
      '14': 'Numéro de carte invalide',
      '41': 'Carte perdue',
      '43': 'Carte volée',
      '51': 'Solde insuffisant',
      '54': 'Carte expirée',
      '57': 'Transaction non autorisée',
      '59': 'Fraude suspectée',
      '63': 'Mesures de sécurité non respectées',
      '75': 'Nombre de tentatives dépassé',
      '90': 'Service temporairement indisponible',
    };

    return errors[code] || 'Une erreur est survenue lors du paiement';
  }

  retryPayment() {
    // Go back to subscription page
    this.router.navigate(['/abonnement']);
  }

  contactSupport() {
    this.router.navigate(['/contactez-nous']);
  }
}
