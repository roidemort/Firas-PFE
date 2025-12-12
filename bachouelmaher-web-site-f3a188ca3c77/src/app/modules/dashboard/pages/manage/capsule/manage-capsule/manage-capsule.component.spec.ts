import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageCapsuleComponent } from './manage-capsule.component';

describe('ManageCapsuleComponent', () => {
  let component: ManageCapsuleComponent;
  let fixture: ComponentFixture<ManageCapsuleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageCapsuleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageCapsuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
