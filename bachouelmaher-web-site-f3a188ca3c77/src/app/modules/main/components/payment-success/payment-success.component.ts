import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div class="max-w-md w-full text-center">
        <div class="mb-6">
          <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
        </div>

        <h1 class="text-3xl font-bold text-gray-900 mb-2">Paiement Réussi !</h1>
        <p class="text-gray-600 mb-6">Votre abonnement a été activé avec succès.</p>

        <div *ngIf="transactionId" class="bg-gray-100 p-4 rounded-lg mb-6">
          <p class="text-sm text-gray-500">ID de transaction</p>
          <p class="font-mono text-gray-800 break-all">{{ transactionId }}</p>
        </div>

        <div class="space-y-3">
          <button (click)="goToDashboard()"
                  class="w-full bg-[#23BAC4] hover:bg-[#1B9198] text-white font-medium py-3 px-6 rounded-lg transition duration-300">
            Accéder à mon tableau de bord
          </button>

          <button (click)="goToSubscriptions()"
                  class="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-lg transition duration-300">
            Voir mes abonnements
          </button>
        </div>

        <!-- Auto-redirect to mobile app -->
        <p class="text-sm text-gray-400 mt-6">
          Redirection automatique dans <span class="font-bold">{{ countdown }}</span> secondes...
        </p>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class PaymentSuccessComponent {
transactionId: string = '';
  countdown: number = 5;
  private countdownInterval: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    // Get transaction ID from URL
    this.route.queryParams.subscribe(params => {
      this.transactionId = params['tid'] || params['TransactionId'] || params['transaction'] || '';
      console.log('Payment success - Transaction ID:', this.transactionId);
    });

    // Auto-redirect to mobile app if in WebView
    this.checkAndRedirectToMobile();
  }

  checkAndRedirectToMobile() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isInWebView = navigator.userAgent.includes('wv') || navigator.userAgent.includes('Galiocare');

    if (isMobile || isInWebView) {
      // Start countdown
      this.countdownInterval = setInterval(() => {
        this.countdown--;
        if (this.countdown === 0) {
          clearInterval(this.countdownInterval);
          // Redirect back to Flutter app
          window.location.href = `galiocare://payment/success?tid=${this.transactionId}`;
        }
      }, 1000);
    }
  }

  goToDashboard() {
    this.router.navigate(['/profil']);
  }

  goToSubscriptions() {
    this.router.navigate(['/profil/gestion-abonnements']);
  }

  ngOnDestroy() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }
}
