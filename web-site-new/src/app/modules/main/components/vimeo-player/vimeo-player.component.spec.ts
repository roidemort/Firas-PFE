import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VimeoPlayerComponent } from './vimeo-player.component';

describe('VimeoPlayerComponent', () => {
  let component: VimeoPlayerComponent;
  let fixture: ComponentFixture<VimeoPlayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VimeoPlayerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VimeoPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
