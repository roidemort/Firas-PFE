import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {map} from "rxjs";
import {SortConfig} from "../models/config.model";

@Injectable({
  providedIn: 'root'
})
export class SectionsService {
  constructor(private http: HttpClient) {}

  updateSection(lessonId: string, data: any){
    return this.http.put<any>(`${environment.apiEndpoint}/admin/sections/edit/${lessonId}`, data)
      .pipe(map(response => {
        return response;
      }));
  }
  getSectionDetails(lessonId: string){
    return this.http.get<any>(`${environment.apiEndpoint}/admin/sections/getDetails/${lessonId}`)
      .pipe(map(response => {
        return response;
      }));
  }
}


