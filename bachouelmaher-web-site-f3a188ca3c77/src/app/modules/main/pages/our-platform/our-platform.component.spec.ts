import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OurPlatformComponent } from './our-platform.component';

describe('OurPlatformComponent', () => {
  let component: OurPlatformComponent;
  let fixture: ComponentFixture<OurPlatformComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OurPlatformComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OurPlatformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
