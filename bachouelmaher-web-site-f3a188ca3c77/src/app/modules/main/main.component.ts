import {AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, OnInit, ViewChild} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./components/header/header.component";
import { FooterComponent } from './components/footer/footer.component';
import { RestrictionService } from 'src/app/core/services/restriction.service';


@Component({
    selector: 'app-nft',
    templateUrl: './main.component.html',
    standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MainComponent implements OnInit, AfterViewInit {
   @ViewChild('restrictedSection') restrictedSection!: ElementRef;

  constructor(private restrictionService: RestrictionService) {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    if (this.restrictedSection) {
      this.restrictionService.applyRestrictions(this.restrictedSection.nativeElement);
    }
  }
}
