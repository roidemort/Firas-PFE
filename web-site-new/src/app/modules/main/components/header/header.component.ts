import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
    isMenuOpen: boolean = false;
    isLogged: boolean
    constructor( private authService: AuthService){
     this.isLogged = this.authService.isAuthenticated()
    }

    toggleMenu(): void {
      this.isMenuOpen = !this.isMenuOpen;
    }

    scrollToPartners() {
      const element = document.getElementById('partners');
      if (element) {
          const yOffset = -100;
          const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
  
          window.scrollTo({ top: y, behavior: 'smooth' });
      }
  }
  
}
