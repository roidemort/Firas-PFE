import {Component, EventEmitter, Input, Output} from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-table-course-action',
  standalone: true,
  imports: [AngularSvgIconModule, ReactiveFormsModule, NgIf],
  templateUrl: './table-action.component.html',
  styleUrl: './table-action.component.scss',
})
export class TableActionComponent {
  @Input() selectedPrice: boolean = true
  @Input() selectedCS: boolean = true

  @Output() changeStatus = new EventEmitter<string>();
  @Output() changeText = new EventEmitter<string>();
  @Output() changePrice = new EventEmitter<string>();
  @Output() changeCS = new EventEmitter<string>();

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
  onChangePrice($event: any){
    this.changePrice.emit($event.target.value);
  }
  onChangeCS($event: any){
    this.changeCS.emit($event.target.value);
  }
  onSubmit() {
    this.submitted = true;
    const { text } = this.form.value;
    this.changeText.emit(text);
  }
}
