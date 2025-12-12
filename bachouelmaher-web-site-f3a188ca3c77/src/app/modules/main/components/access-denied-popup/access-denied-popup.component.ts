import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-access-denied-popup',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './access-denied-popup.component.html',
  styleUrl: './access-denied-popup.component.scss'
})
export class AccessDeniedPopupComponent {
  @Output() closePopup = new EventEmitter<void>();
  loggedUser: any
  constructor(private authService: AuthService){
    
  }

  ngOnInit() {
    this.loggedUser = this.authService.getUser();
    // console.log(this.loggedUser.role)
  }

  close() {
    this.closePopup.emit();
  }
}
