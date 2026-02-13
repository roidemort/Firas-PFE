import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, HostListener, ElementRef } from '@angular/core';
import { SafeUrlPipe } from 'src/app/core/utils/safe-url.pipe';

@Component({
  selector: 'app-card-shorts',
  standalone: true,
  imports: [CommonModule, SafeUrlPipe],
  templateUrl: './card-shorts.component.html',
  styleUrls: ['./card-shorts.component.scss']
})
export class CardShortsComponent implements OnChanges {
  @Input() cards: any[] = [];
  @Input() style: boolean = true;

  transformedCards: any[] = [];
  currentIndex = 0;
  cardsToShow = 4;

  // Mobile swipe variables
  isMobile = false;
  private touchStartX = 0;
  private touchEndX = 0;
  private minSwipeDistance = 50;

  // Navigation variables
  isHoveringPrev = false;
  isHoveringNext = false;
  prevStatus = true;
  nextStatus = true;

  constructor(private elementRef: ElementRef) {
    this.checkIfMobile();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkIfMobile();
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    if (this.isMobile) {
      this.touchStartX = event.changedTouches[0].screenX;
    }
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent) {
    if (this.isMobile) {
      this.touchEndX = event.changedTouches[0].screenX;
      this.handleSwipe();
    }
  }

  private checkIfMobile() {
    this.isMobile = window.innerWidth < 768;
    // On mobile, show only 1 card at a time
    this.cardsToShow = this.isMobile ? 1 : 4;
  }

  private handleSwipe() {
    const distance = this.touchStartX - this.touchEndX;

    // Left swipe (next card)
    if (distance > this.minSwipeDistance && this.currentIndex < this.transformedCards.length - this.cardsToShow) {
      this.nextCard();
    }

    // Right swipe (previous card)
    if (distance < -this.minSwipeDistance && this.currentIndex > 0) {
      this.prevCard();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['cards'] && this.cards) {
      this.transformVimeoUrls();
      this.resetToFirstCard();
    }
  }

  transformVimeoUrls() {
    this.transformedCards = this.cards.map(card => {
      if (!card || !card.url) return card;

      let url = card.url;

      // Transforme https://vimeo.com/VIDEO_ID en https://player.vimeo.com/video/VIDEO_ID
      if (url.includes('vimeo.com/') && !url.includes('player.vimeo.com')) {
        // Extrait l'ID de la vidéo
        const videoId = this.extractVimeoId(url);
        if (videoId) {
          url = `https://player.vimeo.com/video/${videoId}`;
        }
      }

      // Pour YouTube aussi (au cas où)
      if (url.includes('youtube.com/watch?v=')) {
        const videoId = this.extractYoutubeId(url);
        if (videoId) {
          url = `https://www.youtube.com/embed/${videoId}`;
        }
      }

      return {
        ...card,
        url: url
      };
    });

    console.log('Transformed cards:', this.transformedCards);
  }

  private extractVimeoId(url: string): string | null {
    // Supporte différents formats :
    // https://vimeo.com/123456789
    // https://vimeo.com/123456789?param=value
    // https://vimeo.com/album/123456/video/123456789
    const match = url.match(/(?:vimeo\.com\/)(?:album\/\d+\/video\/|channels\/\w+\/|groups\/\w+\/|video\/)?(\d+)/);
    return match ? match[1] : null;
  }

  private extractYoutubeId(url: string): string | null {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  }

  getSafeUrl(url: string): string {
    if (!url) return '';

    if (url.includes('vimeo.com/') && !url.includes('player.vimeo.com')) {
      const videoId = this.extractVimeoId(url);
      return videoId ? `https://player.vimeo.com/video/${videoId}` : url;
    }

    return url;
  }

  truncateText(text: string, length: number): string {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + ' ...' : text;
  }

  resetToFirstCard() {
    this.currentIndex = 0;
  }

  prevCard() {
    this.nextStatus = false;
    this.prevStatus = false;
    if (this.currentIndex > 0) {
      this.currentIndex--;
      setTimeout(() => {
        this.prevStatus = true;
        this.nextStatus = true;
      }, 250);
    }
  }

  nextCard() {
    this.nextStatus = false;
    this.prevStatus = false;
    if (this.currentIndex < this.transformedCards.length - this.cardsToShow) {
      this.currentIndex++;
      setTimeout(() => {
        this.prevStatus = true;
        this.nextStatus = true;
      }, 250);
    }
  }

  goToCard(index: number) {
    if (index >= 0 && index <= this.transformedCards.length - this.cardsToShow) {
      this.currentIndex = index;
    }
  }

  get visibleCards() {
    return this.transformedCards.slice(this.currentIndex, this.currentIndex + this.cardsToShow);
  }
}
