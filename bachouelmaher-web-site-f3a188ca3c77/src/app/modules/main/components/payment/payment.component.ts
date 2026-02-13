import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Package } from 'src/app/core/models/package.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { PackagesService } from 'src/app/core/services/packages.service';
import { PaymentService } from 'src/app/core/services/payment.service';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.scss'
})
export class PaymentComponent {
  packageId: string = '';
  package: Package | null = null;
  durationMonths: number = 1;
  isLoading: boolean = false;

  userInfo = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    pharmacyName: '',
    address: '',
    matriculeFiscale: ''
  };

  amounts = {
    horsTax: 0,
    tva: 0,
    total: 0
  };

  tvaRate = 0.19;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService,
    private packagesService: PackagesService,
    private authService: AuthService
  ) {
    console.log('PaymentComponent initialized');
  }

  ngOnInit() {
    console.log('PaymentComponent ngOnInit');

    this.route.queryParams.subscribe(params => {
      console.log('Query params:', params);
      this.packageId = params['packageId'];
      this.durationMonths = params['duration'] ? parseInt(params['duration']) : 1;

      if (this.packageId) {
        console.log('Loading package with ID:', this.packageId);
        this.loadPackageDetails();
      } else {
        console.error('No package ID found in URL');
      }
    });

    this.loadUserInfo();
  }

  loadPackageDetails() {
    this.isLoading = true;
    console.log('Calling getPackageById with ID:', this.packageId);

    this.packagesService.getPackageDetails(this.packageId).subscribe({
      next: (res: any) => {
        console.log('Package API response:', res);
        this.isLoading = false;

        if (res && res.status === true) {
          // Try different response structures
          this.package = res.data?.package || res.data || res;
          console.log('Package set to:', this.package);
          this.calculateAmounts();
        } else {
          console.error('Package not found in response');
        }
      },
      error: (error) => {
        console.error('Error loading package:', error);
        this.isLoading = false;
      }
    });
  }

  loadUserInfo() {
    const user = this.authService.getUser();
    console.log('User from AuthService:', user);

    if (user) {
      this.userInfo = {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.tel || user.phone || '',
        pharmacyName: user.pharmacyName || '',
        address: user.address || '',
        matriculeFiscale: user.matriculeFiscale || ''
      };
      console.log('User info loaded:', this.userInfo);
    }
  }

  calculateAmounts() {
    if (!this.package) {
      console.log('Cannot calculate amounts: package is null');
      return;
    }

    console.log('Calculating amounts for package:', this.package);
    const price = parseFloat(this.package.price);
    this.amounts.horsTax = price * this.durationMonths;
    this.amounts.tva = this.amounts.horsTax * this.tvaRate;
    this.amounts.total = this.amounts.horsTax + this.amounts.tva;
    console.log('Amounts calculated:', this.amounts);
  }

  onDurationChange() {
    this.calculateAmounts();
  }

  onSubmit() {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;

    this.paymentService.createSubscriptionPayment(this.packageId, this.durationMonths).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res.status) {
          this.simulatePayment(res.data.subscriptionId);
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Payment error:', error);
        alert('Une erreur est survenue. Veuillez réessayer.');
      }
    });
  }

  simulatePayment(subscriptionId: string) {
    alert(`Payment simulation - Subscription ID: ${subscriptionId}\n\nOnce Tunisie Monétique API is integrated, you will be redirected to their secure payment page.`);
  }

  validateForm(): boolean {
    if (!this.userInfo.firstName || !this.userInfo.lastName) {
      alert('Veuillez remplir votre nom et prénom');
      return false;
    }
    if (!this.userInfo.email) {
      alert('Veuillez remplir votre email');
      return false;
    }
    if (!this.userInfo.pharmacyName) {
      alert('Veuillez remplir le nom de votre pharmacie');
      return false;
    }
    if (!this.userInfo.matriculeFiscale) {
      alert('Veuillez remplir votre matricule fiscale');
      return false;
    }
    return true;
  }

  goBack() {
    this.router.navigate(['/abonnement']);
  }
}
