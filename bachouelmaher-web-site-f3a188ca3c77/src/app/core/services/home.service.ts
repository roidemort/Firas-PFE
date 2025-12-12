import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {SortConfig} from "../models/config.model";
import {environment} from "../../../environments/environment";
import {map} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  constructor(private http: HttpClient) {
  }
  getHomeData(status: string) {
    let params = new HttpParams().set('status', status);
  
    return this.http.get<any>(`${environment.apiEndpoint}/home/home-data`, { params })
      .pipe(map(response => response));
  }
  
}
