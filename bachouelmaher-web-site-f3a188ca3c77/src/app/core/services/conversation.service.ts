import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from "../../../environments/environment";
import { map } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ConversationService {

 constructor(private http: HttpClient) { }

  getMine(id: string) {
    return this.http.get<any>(`${environment.apiEndpoint}/conversation/${id}`)
      .pipe(map(response => {
        return response;
      }));
  }

  addConversation(data: any) {
    return this.http.post<any>(`${environment.apiEndpoint}/conversation/addConversation`, data)
      .pipe(map(response => {
        return response;
      }));
  }
}
