import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { PartnersService } from 'src/app/core/services/partners.service';
import Swiper from 'swiper';
import { pricingPlans } from '../../../../core/constants/pricing-plans';
import { PackagesService } from 'src/app/core/services/packages.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { RouterModule } from '@angular/router';
import { SliderComponent } from "../../components/slider/slider.component";

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [CommonModule, RouterModule, SliderComponent],
  templateUrl: './subscription.component.html',
  styleUrl: './subscription.component.scss'
})
export class SubscriptionComponent {
  listPartners: any[] = [];
  pricingPlans: any[] = [];
  features: { [key: string]: string[] } = {};
  isLogged = false
  // pricingPlans = pricingPlans;
  constructor(@Inject(PLATFORM_ID) private platformId: Object,private partnerService: PartnersService, private packageService: PackagesService, private authService: AuthService) {}

  ngOnInit(): void {
    this.isLogged = this.authService.isAuthenticated()
    this.partnerService.getAllActivePartners("1").subscribe((data) => {
      this.listPartners = [...data.data?.partners, ...data.data?.partners];
    });

    this.packageService.getAllActivePackages("1").subscribe((res) => {
      this.pricingPlans = res.data?.packages.sort((a: { position: number; }, b: { position: number; }) => a.position - b.position);

      this.pricingPlans.forEach(plan => {
        this.features[plan?.id] = this.getFeaturesFromDescription(plan.description);
      });
    });
    
  }

  getGridCols(): string {
    const length = this.pricingPlans?.length || 0;
    return `lg:grid-cols-${Math.min(length, 4)}`;
  }  

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      const swiper = new Swiper('.swiper-container', {
        slidesPerView: 8,
        spaceBetween: 16,
        loop: true,
        freeMode: true,
        mousewheel: true,
        grabCursor: true,
        autoplay: {
          delay: 3000,
          disableOnInteraction: false
        }
      });
    }
  }

  getFeaturesFromDescription(description: string): any[] {
    const liMatches = description.match(/<p>(.*?)<\/p>/g);
    return liMatches ? liMatches.map(li => li.replace(/<\/?p>/g, '')) : [];
  }

}
