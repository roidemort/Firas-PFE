import {Component, EventEmitter, OnInit, Output, signal} from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {Pharmacy} from "../../../../../../core/models/pharmacy.model";
import {toast} from "ngx-sonner";
import {PharmaciesService} from "../../../../../../core/services/pharmacies.service";
import {SortConfig} from "../../../../../../core/models/config.model";

@Component({
  selector: 'app-table-course-user-action',
  standalone: true,
  imports: [AngularSvgIconModule, ReactiveFormsModule],
  templateUrl: './table-action.component.html',
  styleUrl: './table-action.component.scss',
})
export class TableActionComponent implements OnInit {
  @Output() changePharmacy = new EventEmitter<string>();

  form!: FormGroup;
  submitted = false;

  isLoading = false;
  pharmacies = signal<Pharmacy[]>([]);
  allPharmaciesCount : number = 0

  constructor(private readonly _formBuilder: FormBuilder, private pharmaciesService: PharmaciesService) {
    this.form = this._formBuilder.group({
      text: ['', ''],
    });
  }
  getPharmacies() {
    this.isLoading = true
    this.pharmaciesService.getAllPharmacies({ column: 'createdAt', direction: 'asc' } as SortConfig, 100, 0 , '', '').subscribe({
      next: (result) => {
        this.pharmacies.set(result.data.pharmacies)
        this.isLoading = false
      },
      error: (error) => this.handleRequestError(error),
    });
  }
  private handleRequestError(error: any) {
    const msg = 'An error occurred while fetching users';
    this.isLoading = false
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
  get f() {
    return this.form.controls;
  }

  onChangePharmacy($event: any){
    this.changePharmacy.emit($event.target.value);
  }

  ngOnInit(): void {
    this.getPharmacies()
  }
}
