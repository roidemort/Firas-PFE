import {Component, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {Subscription} from "../../../../../core/models/subscription.model";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {ToastrService} from "ngx-toastr";
import {ActivatedRoute, Router} from "@angular/router";
import {lastValueFrom} from "rxjs";
import {toast} from "ngx-sonner";
import {SubscriptionsService} from "../../../../../core/services/subscription.service";
import {PackagesService} from "../../../../../core/services/packages.service";
import {SortConfig} from "../../../../../core/models/config.model";
import {Package} from "../../../../../core/models/package.model";
import {User} from "../../../../../core/models/user.model";
import {UsersService} from "../../../../../core/services/users.service";
import {MatOption} from "@angular/material/core";
import {MatSelect} from "@angular/material/select";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import moment from "moment";

@Component({
  selector: 'app-manage-subscription',
  standalone: true,
  imports: [
    FormsModule,
    MatOption,
    MatSelect,
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    NgClass
  ],
  templateUrl: './manage-subscription.component.html',
  styleUrl: './manage-subscription.component.scss'
})
export class ManageSubscriptionComponent  implements OnInit {
  @ViewChild('actions', { static: true, read: ViewContainerRef })
  actions!: ViewContainerRef;
  type!: string | null
  subscriptionId!: string | null
  subscription!: Subscription
  packages : Package[] = [];
  payments = [
    { value: "cash", label: "Espèce"},
    { value: "transfer", label: "Virement"},
    { value: "check", label: "Chèque"},
    { value: "online", label: "En ligne"}
  ]

  selectedPackage!: Package | undefined;
  users : User[] = [];
  displayUsersNumber = false
  file: File | null = null;

  manageSubscriptionForm!: FormGroup;
  isLoading = false
  submitted = false
  datePickerMin = new Date().toISOString().split("T")[0];
  datePickerMax: string = ''

  constructor(private usersService: UsersService, private packagesService: PackagesService, private fb : FormBuilder, private subscriptionsService: SubscriptionsService, private toastr: ToastrService, private router: Router, private route: ActivatedRoute) {
  }
  async ngOnInit() {
    await this.getBuyers()
    await this.getPackages()
    this.type = this.route.snapshot.queryParamMap.get('type');
    this.subscriptionId = this.route.snapshot.queryParamMap.get('subscriptionId');
    this.manageSubscriptionForm = this.fb.group({
      startedAt: [null, Validators.required],
      endedAt: [{ value: null, disabled: true }, [Validators.required]],
      usersNumber: [{ value: null }, [Validators.required]],
      buyer: [null, [Validators.required]],
      package: [null, [Validators.required]],
      paymentMethod: [null, [Validators.required]],
    });

    if (this.type == 'edit') {
      this.manageSubscriptionForm.get('buyer')!.disable();
      this.isLoading = true
      const result$ = this.subscriptionsService.getSubscriptionDetails(this.subscriptionId!)
      const result = await lastValueFrom(result$);
      this.subscription = result.data
      let startDate = moment(this.subscription.startedAt).local().format('yyyy-MM-DD');
      let endDate = moment(this.subscription.endedAt).local().format('yyyy-MM-DD');
      this.datePickerMax = endDate
      this.selectedPackage = this.packages.find(pck => { return pck.id == this.subscription.package.id })
      this.manageSubscriptionForm.patchValue({
        startedAt: startDate,
        endedAt: endDate,
        usersNumber: this.subscription.usersNumber,
        paymentMethod: this.subscription.paymentMethod,
        buyer: this.subscription.buyer.id,
        package: this.subscription.package.id,
      });

      this.isLoading = false
    }
  }
  markAllAsTouched() {
    Object.keys(this.manageSubscriptionForm.controls).forEach((key) => {
      this.manageSubscriptionForm.get(key)?.markAsTouched();
    });
  }

  manageSubscription(){
    this.submitted = true;
    this.markAllAsTouched();
    if (this.manageSubscriptionForm.valid) {
      this.isLoading = true
      const data = {
        startedAt: this.manageSubscriptionForm.value.startedAt,
        endedAt: this.manageSubscriptionForm.value.endedAt || this.datePickerMax,
        usersNumber: this.manageSubscriptionForm.value.usersNumber,
        buyerId: this.manageSubscriptionForm.value.buyer,
        paymentMethod: this.manageSubscriptionForm.value.paymentMethod,
        packageId: this.manageSubscriptionForm.value.package,
      }
      if(this.type == 'add') {
        this.subscriptionsService.addSubscription(data, this.file).subscribe({
          next: (result) => {
            if (result.status) {
              this.isLoading = false
              this.toastr.success('Abonnement ajouté avec succès', 'Enregistré', { timeOut: 1500 });
              this.router.navigate([`/admin985xilinp/dashboard/subscriptions/list`]);
            } else {
              this.isLoading = false;
              this.toastr.warning('Vérifier vos données', 'Vérification', {
                timeOut: 1500
              })
            }
          },
          error: (error) => this.handleRequestError(error),
        });
      }
      if(this.type == 'edit') {
        this.subscriptionsService.updateSubscription(this.subscription.id, data, this.file).subscribe({
          next: (result) => {
            if (result.status) {
              this.isLoading = false
              this.toastr.success('Abonnement modifié avec succès', 'Enregistré', { timeOut: 1500 });
              this.router.navigate([`/admin985xilinp/dashboard/subscriptions/list`]);
            } else {
              this.isLoading = false;
              this.toastr.warning('Vérifier vos données', 'Vérification', {
                timeOut: 1500
              })
            }
          },
          error: (error) => this.handleRequestError(error),
        });
      }
    }
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
  bachToList() {
    this.router.navigate([`/admin985xilinp/dashboard/subscriptions/list`]);
  }

  async getBuyers() {
    this.usersService.getAllUsers({ column: 'createdAt', direction: 'desc' } as SortConfig, 100, 0 ,'', 'PHARMACIST_HOLDER', '', '').subscribe({
      next: (result) => {
        this.isLoading = false
        this.users = result.data.users
      },
      error: (error) => this.handleRequestError(error),
    });
  }
  async getPackages() {
    this.packagesService.getAllPackages({ column: 'position', direction: 'asc' } as SortConfig, 10, 0 , '', '1').subscribe({
      next: (result) => {
        this.packages = result.data.packages
        this.isLoading = false
      },
      error: (error) => this.handleRequestError(error),
    });
  }
  onSelectedPackage(pack: any) {
    this.selectedPackage = this.packages.find(pck => { return pck.id == pack.value })
    if(this.manageSubscriptionForm.value.startedAt) {
      const date = new Date(this.manageSubscriptionForm.value.startedAt);
      this.datePickerMax = new Date(new Date(date).setMonth(date.getMonth() + Number(this.selectedPackage?.duration))).toISOString().split("T")[0]
      this.manageSubscriptionForm.patchValue({
        endedAt: this.datePickerMax
      })
    }
  }
  onSelectStartDate() {
    if(this.selectedPackage) {
      const date = new Date(this.manageSubscriptionForm.value.startedAt);
      this.datePickerMax = new Date(new Date(date).setMonth(date.getMonth() + Number(this.selectedPackage?.duration))).toISOString().split("T")[0]
      this.manageSubscriptionForm.patchValue({
        endedAt: this.datePickerMax
      })
    }
  }
  // On file Select
  onChange(event: any) {
    this.file = event.target.files[0];
  }
}
