import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { SafeUrlPipe } from 'src/app/core/utils/safe-url.pipe';


@Component({
  selector: 'app-card-shorts',
  standalone: true,
  imports: [CommonModule, SafeUrlPipe], // Ajout du pipe
  templateUrl: './card-shorts.component.html',
  styleUrls: ['./card-shorts.component.scss']
})
export class CardShortsComponent {
  @Input() cards: any[] = [];
  @Input() style: boolean = true;
  currentIndex = 0;
  cardsToShow = 4;

  isHoveringPrev = false;
  isHoveringNext = false;
  prevStatus = true
  nextStatus = true

  constructor() {}

  ngOnInit() {
    // this.cards = [...this.cards, ...this.cards]
    // console.log(this.cards);
  }

  truncateText(text: string, length: number): string {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + ' ...' : text;
  }

  prevCard() {
    this.nextStatus = false
    this.prevStatus = false
    if (this.currentIndex > 0) {
      this.currentIndex--;
      setTimeout(() => {
        this.prevStatus = true
        this.nextStatus = true
      }, 250);
    }
  }

  nextCard() {
    this.nextStatus = false
    this.prevStatus = false
    if (this.currentIndex < this.cards.length - this.cardsToShow) {
      this.currentIndex++;
      setTimeout(() => {
        this.prevStatus = true
        this.nextStatus = true
      }, 250);
    }
  }

  get visibleCards() {
    return this.cards.slice(this.currentIndex, this.currentIndex + this.cardsToShow);
  }
  
}

