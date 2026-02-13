import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  isLogged = false
  constructor(private authService: AuthService) {

  }

  ngOnInit(): void {
    this.isLogged = this.authService.isAuthenticated()
  }
}
