import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessDeniedPopupComponent } from './access-denied-popup.component';

describe('AccessDeniedPopupComponent', () => {
  let component: AccessDeniedPopupComponent;
  let fixture: ComponentFixture<AccessDeniedPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccessDeniedPopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccessDeniedPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
