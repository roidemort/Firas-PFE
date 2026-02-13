import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class AdvertisementService {
  private readonly LAST_AD_INDEX_KEY = 'lastAdIndex';
  private readonly SESSION_KEY = 'adSessionKey';

  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  getLastAdIndex(): number {
    if (isPlatformBrowser(this.platformId)) {
      return Number(localStorage.getItem(this.LAST_AD_INDEX_KEY)) || 0;
    }
    return 0;
  }

  setLastAdIndex(index: number): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.LAST_AD_INDEX_KEY, index.toString());
    }
  }

  isAdShownInSession(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return sessionStorage.getItem(this.SESSION_KEY) === 'true';
    }
    return false;
  }

  setAdShownInSession(): void {
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.setItem(this.SESSION_KEY, 'true');
    }
  }

  resetSessionStatus(): void {
    if (isPlatformBrowser(this.platformId) && !sessionStorage.getItem(this.SESSION_KEY)) {
      const nextAdIndex = this.getLastAdIndex() + 1;
      this.setLastAdIndex(nextAdIndex);
    }
  }
}
