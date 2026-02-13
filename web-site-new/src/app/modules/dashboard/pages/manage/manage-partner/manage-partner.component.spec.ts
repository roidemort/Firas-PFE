import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagePartnerComponent } from './manage-partner.component';

describe('ManagePartnerComponent', () => {
  let component: ManagePartnerComponent;
  let fixture: ComponentFixture<ManagePartnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagePartnerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagePartnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
