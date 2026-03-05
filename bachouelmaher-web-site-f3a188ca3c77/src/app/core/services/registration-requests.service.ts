import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SortConfig } from '../models/config.model';

export interface RegistrationRequest {
  id: string;
  pharmacyName: string;
  pharmacyEmail: string;
  pharmacyAddress: string;
  pharmacyPhone: string;
  nbPharmacien: number;
  nbPreparatoire: number;
  ownerLastName: string;
  ownerFirstName: string;
  status: number;
  activationKey?: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class RegistrationRequestsService {
  constructor(private http: HttpClient) {}

  getAllRegistrationRequests(sortConfig: SortConfig, itemsPerPage: number, currentPage: number, status?: number): Observable<any> {
    let params = new HttpParams()
      .set('take', itemsPerPage.toString())
      .set('page', currentPage.toString());
    if (status !== undefined) { params = params.set('status', status.toString()); }
    if (sortConfig && sortConfig.column) { params = params.set('orderBy', `${sortConfig.column}:${sortConfig.direction}`); }
    return this.http.get<any>(`${environment.apiEndpoint}/admin/registration-requests`, { params });
  }

  approveRegistrationRequest(id: string): Observable<any> {
    return this.http.post<any>(`${environment.apiEndpoint}/admin/approve/${id}`, {});
  }

  rejectRegistrationRequest(id: string): Observable<any> {
    return this.http.post<any>(`${environment.apiEndpoint}/admin/reject/${id}`, {});
  }
}

