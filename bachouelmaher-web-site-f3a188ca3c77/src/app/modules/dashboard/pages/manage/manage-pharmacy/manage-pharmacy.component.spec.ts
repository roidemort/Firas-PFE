import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagePharmacyComponent } from './manage-pharmacy.component';

describe('ManagePharmacyComponent', () => {
  let component: ManagePharmacyComponent;
  let fixture: ComponentFixture<ManagePharmacyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagePharmacyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagePharmacyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
