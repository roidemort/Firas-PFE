import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardShortsComponent } from './card-shorts.component';

describe('CardShortsComponent', () => {
  let component: CardShortsComponent;
  let fixture: ComponentFixture<CardShortsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardShortsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardShortsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
