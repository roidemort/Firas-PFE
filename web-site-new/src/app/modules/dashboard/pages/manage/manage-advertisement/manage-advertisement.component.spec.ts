import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageAdvertisementComponent } from './manage-advertisement.component';

describe('ManageAdvertisementComponent', () => {
  let component: ManageAdvertisementComponent;
  let fixture: ComponentFixture<ManageAdvertisementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageAdvertisementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageAdvertisementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
