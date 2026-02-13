import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import Player from '@vimeo/player';
import { MainLoaderComponent } from "../loader/loader.component";
@Component({
  selector: 'app-vimeo-player',
  standalone: true,
  imports: [CommonModule, MainLoaderComponent],
  templateUrl: './vimeo-player.component.html',
  styleUrl: './vimeo-player.component.scss'
})
export class VimeoPlayerComponent implements AfterViewInit {
  @ViewChild('vimeoPlayerContainer', { static: false }) vimeoPlayerContainer!: ElementRef;
  @Output() videoEvent = new EventEmitter<string>();
  @Input() time!: string | null;
  @Input() id!: string | null;
  isLoading = false
  private player!: Player;

  constructor(){ }

  ngOnInit(){
    this.isLoading = true
  }

  ngAfterViewInit() {
    this.initVimeoPlayer();
  }

  getTextFromHtml(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }

  getPlayerWidth(): number {
    const screenWidth = window.innerWidth;
    let playerWidth = screenWidth * 0.8;
  
    if (screenWidth > 1600) {
      playerWidth = screenWidth * 0.8;
    } else if (screenWidth <= 1440 && screenWidth > 1024) {
      playerWidth = screenWidth * 0.725;
    } else if (screenWidth <= 1024 && screenWidth > 768) {
      playerWidth = screenWidth * 0.7;
    } else if (screenWidth <= 768) {
      playerWidth = screenWidth * 0.9;
    } else if (screenWidth <= 576) {
      playerWidth = screenWidth * 0.95;
    }
    
    return Math.min(playerWidth, 1200);
  }

  private initVimeoPlayer() {
    const extractedId = this.getTextFromHtml(this.id!);
    const videoId = extractedId && !isNaN(Number(extractedId)) ? Number(extractedId) : 1027806934;
    // console.log(videoId)

    const vimeoContainer = this.vimeoPlayerContainer.nativeElement;
    this.player = new Player(this.vimeoPlayerContainer.nativeElement, {
      id: videoId,
      width: this.getPlayerWidth()
    });

    this.player.ready().then(() => {
      const iframe = this.vimeoPlayerContainer.nativeElement.querySelector('iframe');
      if (iframe) {
        iframe.style.width = '100%';
        iframe.style.height = 'auto';
        iframe.style.aspectRatio = '16 / 9';

        vimeoContainer.classList.remove('hidden');
        vimeoContainer.classList.add('visible');
        this.isLoading = false
      }
    });

    this.player.on('play', () => {
      this.videoEvent.emit('startedAt');
    });

    this.player.on('pause', async () => {
      const currentTime = await this.player.getCurrentTime();
      this.videoEvent.emit(`pause: ${this.formatTime(currentTime)}`);
    });

    this.player.on('ended', () => {
      this.videoEvent.emit('endedAt');
    });

    if (this.time) {
      const seconds = this.convertTimeToSeconds(this.time);
      this.player.setCurrentTime(seconds).catch(err => console.error('Error setting time:', err));
    }
  }

  private formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${this.padTime(minutes)}:${this.padTime(remainingSeconds)}`;
  }

  private padTime(value: number): string {
    return value < 10 ? `0${value}` : `${value}`;
  }

  private convertTimeToSeconds(time: string): number {
    const [minutes, seconds] = time.split(':').map(Number);
    return minutes * 60 + seconds;
  }
}
