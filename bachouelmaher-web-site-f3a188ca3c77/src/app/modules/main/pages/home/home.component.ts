import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, ElementRef, HostListener, Inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { ItemService } from 'src/app/core/services/items.service';
import { PartnersService } from 'src/app/core/services/partners.service';
import Swiper from 'swiper';
import { Navigation } from 'swiper/modules';
import { items } from '../../../../core/constants/carousel';
import { blockItems } from '../../../../core/constants/blocks';
import { AuthService } from 'src/app/core/services/auth.service';
import { RouterModule } from '@angular/router';
import { SwiperOptions } from 'swiper/types';
import { RestrictionService } from 'src/app/core/services/restriction.service';
import { SliderComponent } from "../../components/slider/slider.component";
import { TrendsService } from 'src/app/core/services/trends.service';
import { AdvertisementsService } from 'src/app/core/services/advertisements.service';
import { AdvertisementComponent } from "../../components/advertisement/advertisement.component";
import { LocalStorageService } from 'src/app/core/services/localstorage.service';
import { AdvertisementService } from 'src/app/core/services/advertisements-event.service';
import { HomeService } from 'src/app/core/services/home.service';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, SliderComponent, AdvertisementComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements AfterViewInit{
  items = items;
  blockItems = [...blockItems, ...blockItems];
  isLogged = false
  listPartners: any[] = [];
  listTrends: any[] = [];
  listAdvertisements: any[] = [];
  selectedAd: any = null;


  constructor(@Inject(PLATFORM_ID) private platformId: Object, private itemService: ItemService, private partnerService: PartnersService, private authService: AuthService, private trendsService: TrendsService, private advertisementsService: AdvertisementsService, private localStorageService: LocalStorageService, private advertisementService: AdvertisementService, private homeService: HomeService
) { }


  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.homeService.getHomeData("1").subscribe({
        next: (result) => {
          const data = result?.data || {};
          this.listPartners = [...(data.partners || []), ...(data.partners || [])];
          this.listTrends = [...(data.trends || [])];
          const advertisements = data.advertisements || [];

          const lastAdIndex = this.advertisementService.getLastAdIndex() % advertisements.length;

          if (advertisements.length && !this.advertisementService.isAdShownInSession()) {
            this.showAdvertisement(advertisements[lastAdIndex]);
            this.advertisementService.setAdShownInSession();
          }
        },
        error: (error) => {
          console.error('Error fetching home data:', error);
        }
      });

      if (!sessionStorage.getItem('sessionInitialized')) {
        this.advertisementService.resetSessionStatus();
        sessionStorage.setItem('sessionInitialized', 'true');
      }
    }

    this.isLogged = this.authService.isAuthenticated();
  }

  showAdvertisement(ad: any) {
    this.selectedAd = ad;
  }

  closeModal() {
    this.selectedAd = null;
  }

  scrollToPartners() {
    const element = document.getElementById('partners');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
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

      this.initializeSwiper('.mySwiper', {
        slidesPerView: 5,
        spaceBetween: 20,
        breakpoints: {
          320: { slidesPerView: 3, spaceBetween: 10 },
          425: { slidesPerView: 4, spaceBetween: 10 },
          768: { slidesPerView: 5, spaceBetween: 10 },
        },
      });

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
