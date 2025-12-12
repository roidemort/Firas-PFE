import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {  pricingPlansProfile } from '../../../../core/constants/pricing-plans';
import { PackagesService } from 'src/app/core/services/packages.service';
import { UsersService } from 'src/app/core/services/users.service';
import { MainLoaderComponent } from "../loader/loader.component";
@Component({
  selector: 'app-subscription-management',
  standalone: true,
  imports: [CommonModule, MainLoaderComponent],
  templateUrl: './subscription-management.component.html',
  styleUrl: './subscription-management.component.scss'
})
export class SubscriptionManagementComponent {
  //pricingPlans =  pricingPlansProfile;
  pricingPlans: any[] = [];
  features: { [key: string]: string[] } = {};
  currentPlan: any
  otherPlans: any
  isLoading = false
  usersSubscribed: any
  constructor(private packageService: PackagesService, private userService: UsersService){
    
  }
  ngOnInit() {
    this.isLoading = true
    this.getPlan()
    this.getData()
    this.getPlanDetails()

  }

  getFeaturesFromDescription(description: string): any[] {
    const liMatches = description.match(/<p>(.*?)<\/p>/g);
    return liMatches ? liMatches.map(li => li.replace(/<\/?p>/g, '')) : [];
  }

  getPlan(){
    this.userService.getUserPlan().subscribe({
      next: (res) => {
        if(res.status){
          this.currentPlan = res.data.subscription
          // console.log(this.currentPlan)
          this.getData()
        }
      },
      error: (error) => {
        console.error(error)
      }
    });
  }

  getPlanDetails(){
    this.userService.getMyPlanDetails().subscribe({
      next: (res) => {
        if(res.status){
          this.usersSubscribed = res.data.subscription
          this.usersSubscribed = this.sortMembers(this.usersSubscribed)
          // console.log('usersSubscribed',this.usersSubscribed)
        }
      },
      error: (error) => {
        console.error(error)
      }
    });
  }
  
  getData(){
    this.packageService.getAllActivePackages("1").subscribe({
      next: (res) => {
        if (res.status){
          this.otherPlans = res.data.packages.filter((plan: { id: any; }) => plan.id !== this.currentPlan?.package?.id);
          this.pricingPlans = this.otherPlans || [];
          if (this.pricingPlans.length > 0) {
            this.pricingPlans.forEach(plan => {
              this.features[plan?.id] = this.getFeaturesFromDescription(plan.description);
            });
            
            // Trier les plans restants par position
            this.pricingPlans.sort((a, b) => a.position - b.position);
          }
          this.isLoading = false
        }
      },
      error: (error) => {
        console.error(error)
      }
    });
  }

  calculatePercentage(usersNumber: number, packageUsersNumber: number): number {
    if (!usersNumber || !packageUsersNumber) {
      return 0; // Par défaut, 0 si les valeurs sont invalides
    }
    return Math.floor((usersNumber / packageUsersNumber) * 100); // Arrondit vers le bas
  }

  getNextPaymentDate(endedAt: string | null): Date | null {
    if (!endedAt) {
      return null;
    }
  
    const date = new Date(endedAt);
    date.setDate(date.getDate() - 1);
    return date;
  }
  
  goToSubscriptions() {
    const element = document.getElementById('subscriptions');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  sortMembers(members: any): any{
    // const sortedUsers = res.data.users.sort((a: { role: string; }, b: { role: any; }) => a.role.localeCompare(b.role));
    const sortedUsers = members.users.filter((user: { role: string; }) => user.role !== "PHARMACIST_HOLDER")
    .sort((a: { role: string; }, b: { role: any; }) => a.role
    .localeCompare(b.role));
    return sortedUsers
  }
}
