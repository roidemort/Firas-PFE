import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateMultipleKeysDialogComponent } from './generate-multiple-keys-dialog.component';

describe('GenerateMultipleKeysDialogComponent', () => {
  let component: GenerateMultipleKeysDialogComponent;
  let fixture: ComponentFixture<GenerateMultipleKeysDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenerateMultipleKeysDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenerateMultipleKeysDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
