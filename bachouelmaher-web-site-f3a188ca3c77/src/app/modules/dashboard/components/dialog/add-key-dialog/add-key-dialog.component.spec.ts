import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddKeyDialogComponent } from './add-key-dialog.component';

describe('ManagePharmacyDialogComponent', () => {
  let component: AddKeyDialogComponent;
  let fixture: ComponentFixture<AddKeyDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddKeyDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddKeyDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
