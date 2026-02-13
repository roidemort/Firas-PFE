import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageLessonComponent } from './manage-lesson.component';

describe('ManageLessonComponent', () => {
  let component: ManageLessonComponent;
  let fixture: ComponentFixture<ManageLessonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageLessonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageLessonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
