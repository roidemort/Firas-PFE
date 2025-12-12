import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {AuthService} from "../../core/services/auth.service";

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    standalone: true,
    imports: [RouterOutlet],
})
export class DashboardComponent implements OnInit {
  constructor(private authService: AuthService) {
  }

  ngOnInit(): void {}
}
