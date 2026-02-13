import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, Inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { ItemService } from 'src/app/core/services/items.service';
import { PartnersService } from 'src/app/core/services/partners.service';
import Swiper from 'swiper';
import { blockItems } from '../../../../core/constants/blocks';
import { AuthService } from 'src/app/core/services/auth.service';
import { SwiperOptions } from 'swiper/types';
import { RestrictionService } from 'src/app/core/services/restriction.service';

@Component({
  selector: 'app-slider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './slider.component.html',
  styleUrl: './slider.component.scss'
})
export class SliderComponent {
  blockItems = [...blockItems, ...blockItems];
  listPartners: any[] = [];

  constructor(@Inject(PLATFORM_ID) private platformId: Object,private itemService: ItemService, private partnerService: PartnersService, private authService: AuthService, private restrictionService: RestrictionService) {}
  
  ngOnInit(): void {
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

      this.initializeSwiper('.swiper-container-1', {
        ...commonConfig,
        slidesPerView: 3,
        breakpoints: {
          320: { slidesPerView: 1 },
          425: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
          1024: { slidesPerView: 4 },
        },
      });
    }
  }

  private initializeSwiper(containerClass: string, config: SwiperOptions): void {
    new Swiper(containerClass, config);
  }
}

