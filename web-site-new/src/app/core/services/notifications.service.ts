import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { map } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  constructor(private http: HttpClient) { }

  getMine() {
    return this.http.get<any>(`${environment.apiEndpoint}/notifications`)
      .pipe(map(response => {
        return response;
      }));
  }

  countMine() {
    return this.http.get<any>(`${environment.apiEndpoint}/notifications/countMine`)
      .pipe(map(response => {
        return response;
      }));
  }

  getDetails(id: string) {
    return this.http.get<any>(`${environment.apiEndpoint}/notifications/getDetails/${id}`)
      .pipe(map(response => {
        return response;
      }));
  }



}
