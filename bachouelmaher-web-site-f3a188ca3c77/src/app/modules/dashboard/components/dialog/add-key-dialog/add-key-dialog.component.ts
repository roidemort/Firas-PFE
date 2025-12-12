import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from "@angular/forms";
import {NgClass, NgIf} from "@angular/common";
import {SvgIconComponent} from "angular-svg-icon";

@Component({
  selector: 'app-manage-key-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    NgClass,
    SvgIconComponent
  ],
  templateUrl: './add-key-dialog.component.html',
  styleUrl: './add-key-dialog.component.scss'
})
export class AddKeyDialogComponent implements OnInit {
  @Output() closeActions = new EventEmitter<any>();

  manageKeyForm!: FormGroup;
  isLoading = false

  constructor(private fb : FormBuilder) {

  }
  async ngOnInit() {
    this.manageKeyForm = this.fb.group({
      role: [null, Validators.required],
    });
  }

  markAllAsTouched() {
    Object.keys(this.manageKeyForm.controls).forEach((key) => {
      this.manageKeyForm.get(key)?.markAsTouched();
    });
  }
  onCloseActions(){
    this.closeActions.emit('close');
  }
  manageKey(){
    this.markAllAsTouched();
    if (this.manageKeyForm.valid) {
      this.isLoading = true
      this.closeActions.emit(this.manageKeyForm.value.role);
    }
  }
}
