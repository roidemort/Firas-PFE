import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TitulaireService {

  private apiUrl = '/api/pharmacy';

  constructor(private http: HttpClient) { }

  getStaffStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/staff-stats`);
  }

  addStaffMember(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/add-staff`, data);
  }
}
