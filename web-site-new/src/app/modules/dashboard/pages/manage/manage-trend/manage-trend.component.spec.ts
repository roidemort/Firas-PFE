import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageTrendComponent } from './manage-trend.component';

describe('ManageTrainerComponent', () => {
  let component: ManageTrendComponent;
  let fixture: ComponentFixture<ManageTrendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageTrendComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageTrendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
