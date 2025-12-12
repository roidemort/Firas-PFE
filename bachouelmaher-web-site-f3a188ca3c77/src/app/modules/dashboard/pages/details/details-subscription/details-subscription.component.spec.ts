import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsSubscriptionComponent } from './details-subscription.component';

describe('DetailsSubscriptionComponent', () => {
  let component: DetailsSubscriptionComponent;
  let fixture: ComponentFixture<DetailsSubscriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsSubscriptionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailsSubscriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
