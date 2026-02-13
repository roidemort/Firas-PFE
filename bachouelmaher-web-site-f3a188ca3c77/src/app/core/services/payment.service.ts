import { Injectable } from '@angular/core';
import {environment} from "../../../environments/environment";
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  private apiUrl = environment.apiEndpoint

  constructor(private http: HttpClient) {}

  // Create subscription and get payment URL
  createSubscriptionPayment(packageId: string, durationMonths: number = 1): Observable<any> {
    return this.http.post(`${this.apiUrl}/payment/create`, {
      packageId,
      durationMonths
    });
  }

  // Check payment status
  checkPaymentStatus(subscriptionId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/payment/status/${subscriptionId}`);
  }
}
