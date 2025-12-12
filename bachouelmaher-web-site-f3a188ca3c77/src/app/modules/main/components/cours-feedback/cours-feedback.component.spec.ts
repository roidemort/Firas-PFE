import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoursFeedbackComponent } from './cours-feedback.component';

describe('CoursFeedbackComponent', () => {
  let component: CoursFeedbackComponent;
  let fixture: ComponentFixture<CoursFeedbackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoursFeedbackComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoursFeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
