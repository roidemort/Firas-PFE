import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { VimeoPlayerComponent } from "../vimeo-player/vimeo-player.component";

@Component({
  selector: 'app-advertisement',
  standalone: true,
  imports: [CommonModule, VimeoPlayerComponent],
  templateUrl: './advertisement.component.html',
  styleUrl: './advertisement.component.scss'
})
export class AdvertisementComponent {
  @Input() ad: any;
  @Output() closeModal = new EventEmitter<void>();
  constructor(){
    
  }

  ngOnInit() {
    // console.log(this.ad)
  }

  close() {
    this.closeModal.emit();
  }
}
