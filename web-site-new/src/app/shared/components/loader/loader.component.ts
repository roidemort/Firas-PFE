import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss'],
  imports:[CommonModule],
  standalone: true,
})
export class LoaderComponent {
  @Input() style : boolean = true;
}
