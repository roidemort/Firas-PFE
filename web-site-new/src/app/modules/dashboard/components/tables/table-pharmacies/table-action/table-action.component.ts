import {Component, EventEmitter, Output} from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";

@Component({
  selector: 'app-table-pharmacy-action',
  standalone: true,
  imports: [AngularSvgIconModule, ReactiveFormsModule],
  templateUrl: './table-action.component.html',
  styleUrl: './table-action.component.scss',
})
export class TableActionComponent {
  @Output() changeStatus = new EventEmitter<string>();
  @Output() changeText = new EventEmitter<string>();

  form!: FormGroup;
  submitted = false;

  constructor(private readonly _formBuilder: FormBuilder) {
    this.form = this._formBuilder.group({
      text: ['', ''],
    });
  }

  get f() {
    return this.form.controls;
  }

  onChangeStatus($event: any){
    this.changeStatus.emit($event.target.value);
  }
  onSubmit() {
    this.submitted = true;
    const { text } = this.form.value;
    this.changeText.emit(text);
  }
}
