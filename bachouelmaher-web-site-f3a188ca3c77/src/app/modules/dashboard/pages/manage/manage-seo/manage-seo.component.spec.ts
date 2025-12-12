import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageSeoComponent } from './manage-seo.component';

describe('ManageSeoComponent', () => {
  let component: ManageSeoComponent;
  let fixture: ComponentFixture<ManageSeoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageSeoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageSeoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
