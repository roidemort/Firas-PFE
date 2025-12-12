import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {SortConfig} from "../models/config.model";
import {environment} from "../../../environments/environment";
import {map} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class SubscriptionsService {
  constructor(private http: HttpClient) {
  }
  getAllSubscriptions(sort : SortConfig, take: number, page: number, text?: string, status?: string, date?: string, packageId?: string) {
    let orderBy = sort && sort.column && sort.direction ? `${sort.column}:${sort.direction}` : null;
    let params = new HttpParams();
    if(orderBy) params = params.append('orderBy', orderBy!);
    params = params.append('take', take.toString());
    params = params.append('page', page.toString());
    if(status) params = params.append('status', status!);
    if(date) params = params.append('date', date!);
    if(packageId) params = params.append('package', packageId!);

    return this.http.get<any>(`${environment.apiEndpoint}/admin/subscriptions`, { params: params })
      .pipe(map(response => {
        return response;
      }));
  }
  updateSubscription(subscriptionId: string, data: any, file: File | null){
    // Create form data
    const formData = new FormData();
    // Store form name as "file" with file data
    if(file) formData.append('upload', file);
    if(data.startedAt) formData.append("startedAt", data.startedAt);
    if(data.endedAt) formData.append("endedAt", data.endedAt);
    if(data.usersNumber) formData.append("usersNumber", data.usersNumber);
    if(data.buyerId) formData.append("buyerId", data.buyerId);
    if(data.paymentMethod) formData.append("paymentMethod", data.paymentMethod);
    if(data.packageId) formData.append("packageId", data.packageId);
    if(data.status) formData.append("status", data.status);
    return this.http.put<any>(`${environment.apiEndpoint}/admin/subscriptions/edit/${subscriptionId}`, formData)
      .pipe(map(response => {
        return response;
      }));
  }
  addSubscription(data: any, file: File | null){
    // Create form data
    const formData = new FormData();
    // Store form name as "file" with file data
    if(file) formData.append('upload', file);
    if(data.startedAt) formData.append("startedAt", data.startedAt);
    if(data.endedAt) formData.append("endedAt", data.endedAt);
    if(data.usersNumber) formData.append("usersNumber", data.usersNumber);
    if(data.buyerId) formData.append("buyerId", data.buyerId);
    if(data.paymentMethod) formData.append("paymentMethod", data.paymentMethod);
    if(data.packageId) formData.append("packageId", data.packageId);
    return this.http.post<any>(`${environment.apiEndpoint}/admin/subscriptions/add/`, formData)
      .pipe(map(response => {
        return response;
      }));
  }
  getSubscriptionDetails(subscriptionId: string){
    return this.http.get<any>(`${environment.apiEndpoint}/admin/subscriptions/getDetails/${subscriptionId}`)
      .pipe(map(response => {
        return response;
      }));
  }
}
