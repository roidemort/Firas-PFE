import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsPharmacyComponent } from './details-pharmacy.component';

describe('DetailsPharmacyComponent', () => {
  let component: DetailsPharmacyComponent;
  let fixture: ComponentFixture<DetailsPharmacyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsPharmacyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailsPharmacyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
