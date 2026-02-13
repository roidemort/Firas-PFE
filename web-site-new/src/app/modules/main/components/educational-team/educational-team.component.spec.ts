import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EducationalTeamComponent } from './educational-team.component';

describe('EducationalTeamComponent', () => {
  let component: EducationalTeamComponent;
  let fixture: ComponentFixture<EducationalTeamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EducationalTeamComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EducationalTeamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
