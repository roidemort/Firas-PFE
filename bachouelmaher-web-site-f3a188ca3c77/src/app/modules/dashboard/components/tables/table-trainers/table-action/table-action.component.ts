import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatOption} from "@angular/material/core";
import {MatSelect} from "@angular/material/select";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {ProvidersService} from "../../../../../../core/services/providers.service";
import {Provider} from "../../../../../../core/models/provider.model";
import {toast} from "ngx-sonner";

@Component({
  selector: 'app-table-trainer-action',
  standalone: true,
  imports: [AngularSvgIconModule, ReactiveFormsModule, MatOption, MatSelect, NgForOf, NgIf, NgClass],
  templateUrl: './table-action.component.html',
  styleUrl: './table-action.component.scss',
})
export class TableActionComponent implements OnInit {
  @Output() changeStatus = new EventEmitter<string>();
  @Output() changeProvider = new EventEmitter<string>();
  @Output() changeText = new EventEmitter<string>();

  form!: FormGroup;
  submitted = false;
  providers!: Provider[]
  isLoading = false

  constructor(private readonly _formBuilder: FormBuilder, private providersService: ProvidersService) {
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
  onChangeProvider($event: any){
    this.changeProvider.emit($event.target.value);
  }
  onSubmit() {
    this.submitted = true;
    const { text } = this.form.value;
    this.changeText.emit(text);
  }
  async getProviders() {
    this.isLoading = true
    this.providersService.getAllActiveProviders(1).subscribe({
      next: (result) => {
        this.providers = result.data.providers
        this.isLoading = false
      },
      error: (error) => this.handleRequestError(error),
    });
  }
  private handleRequestError(error: any) {
    const msg = 'An error occurred while fetching users';
    toast.error(msg, {
      position: 'bottom-right',
      description: error.message,
      action: {
        label: 'Undo',
        onClick: () => console.log('Action!'),
      },
      actionButtonStyle: 'background-color:#DC2626; color:white;',
    });
  }

  async ngOnInit() {
    await this.getProviders()
  }
}
