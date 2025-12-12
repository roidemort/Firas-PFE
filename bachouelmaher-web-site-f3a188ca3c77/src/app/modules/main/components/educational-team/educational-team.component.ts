import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-educational-team',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './educational-team.component.html',
  styleUrl: './educational-team.component.scss'
})
export class EducationalTeamComponent {
  @Input() trainers!: any;

  ngOnInit(){
  }
}
