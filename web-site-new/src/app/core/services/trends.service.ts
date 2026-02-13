import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {SortConfig} from "../models/config.model";
import {environment} from "../../../environments/environment";
import {map} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class TrendsService {
  constructor(private http: HttpClient) {
  }
  getAllTrends(sort : SortConfig, take: number, page: number, text?: string, status?: string, providers?: string) {
    let orderBy = sort && sort.column && sort.direction ? `${sort.column}:${sort.direction}` : null;
    let params = new HttpParams();
    if(orderBy) params = params.append('orderBy', orderBy!);
    params = params.append('take', take.toString());
    params = params.append('page', page.toString());
    params = params.append('relations', 'image');
    if(text) params = params.append('text', `title:${text}`);
    if(status) params = params.append('status', status!);

    return this.http.get<any>(`${environment.apiEndpoint}/trends`, { params: params })
      .pipe(map(response => {
        return response;
      }));
  }
  updateTrend(trendId: string, data: any){
    return this.http.put<any>(`${environment.apiEndpoint}/admin/trends/edit/${trendId}`, data)
      .pipe(map(response => {
        return response;
      }));
  }
  addTrend(data: any){
    return this.http.post<any>(`${environment.apiEndpoint}/admin/trends/add/`, data)
      .pipe(map(response => {
        return response;
      }));
  }
  getTrendDetails(trendId: string){
    return this.http.get<any>(`${environment.apiEndpoint}/trends/getDetails/${trendId}`)
      .pipe(map(response => {
        return response;
      }));
  }

  getAllActiveTrends(status: string) {
    let params = new HttpParams();
    params = params.append('take', 20);
    params = params.append('relations', 'image');
    if(status) params = params.append('status', status!);

    return this.http.get<any>(`${environment.apiEndpoint}/trends`, { params: params })
      .pipe(map(response => {
        return response;
      }));
  }
}
