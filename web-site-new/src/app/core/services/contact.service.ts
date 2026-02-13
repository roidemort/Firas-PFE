import { Injectable } from '@angular/core';
import {map} from 'rxjs';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";


@Injectable({
  providedIn: 'root'
})
export class ContactService {
  constructor(private http: HttpClient) {
  }

  sendMail(data: any){
    return this.http.post<any>(`${environment.apiEndpoint}/contact/send`, data)
      .pipe(map(response => {
        return response;
      }));
  }

}
