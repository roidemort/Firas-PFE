import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { SidebarService } from 'src/app/core/services/sidebar.service';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.scss'
})
export class AlertComponent {
  @Input() handleErrorResponse = false;
  @Input() handleResponse = false;
  @Input() handleError = false;
  @Input() alertMessage = '';
  @Input() SideBarIsOpen  = false;

  isSidebarOpen: boolean = false;

  constructor(private sidebarService: SidebarService) {}

  closeAlert() {
    this.resetAlerts();
  }

  resetAlerts() {
    this.handleError = false;
    this.handleResponse = false;
    this.handleErrorResponse = false;
  }
  ngOnInit() {
    // S'abonner à l'état de la sidebar
    this.sidebarService.sidebarState$.subscribe((isOpen: boolean) => {
      this.isSidebarOpen = isOpen;
    });
  }
}
