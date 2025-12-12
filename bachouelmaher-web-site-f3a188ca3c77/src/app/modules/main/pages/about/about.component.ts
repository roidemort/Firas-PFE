import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, Inject, PLATFORM_ID } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { PartnersService } from 'src/app/core/services/partners.service';
import Swiper from 'swiper';
import { SliderComponent } from "../../components/slider/slider.component";
import { SwiperOptions } from 'swiper/types';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule, SliderComponent],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent implements AfterViewInit {
  listPartners: any[] = [];
  isLogged = false

  constructor(@Inject(PLATFORM_ID) private platformId: Object,private partnerService: PartnersService,  private authService: AuthService) {}

  ngOnInit(): void {
    this.isLogged = this.authService.isAuthenticated()
    this.partnerService.getAllActivePartners("1").subscribe({
      next: (result) => {
        this.listPartners = [...result?.data?.partners, ...result?.data?.partners];
      },
      error: (error) => {
        console.error(error)
      }
    });
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      const commonConfig: SwiperOptions = {
        spaceBetween: 16,
        loop: true,
        freeMode: true,
        mousewheel: true,
        grabCursor: true,
        autoplay: {
          delay: 3000,
          disableOnInteraction: false,
        },
      };
      this.initializeSwiper('.swiper-container', {
        ...commonConfig,
        slidesPerView: 8,
        breakpoints: {
          320: { slidesPerView: 3 },
          425: { slidesPerView: 4 },
          768: { slidesPerView: 5 },
          1024: { slidesPerView: 6 },
          1440: { slidesPerView: 7 },
        },
      });
    }
  }

  private initializeSwiper(containerClass: string, config: SwiperOptions): void {
    new Swiper(containerClass, config);
  }
}
