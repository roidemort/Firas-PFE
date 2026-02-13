import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {SortConfig} from "../models/config.model";
import {environment} from "../../../environments/environment";
import {map} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ProvidersService {
  constructor(private http: HttpClient) {
  }
  getAllProviders(sort : SortConfig, take: number, page: number, text?: string, status?: string) {
    let orderBy = sort && sort.column && sort.direction ? `${sort.column}:${sort.direction}` : null;
    let params = new HttpParams();
    if(orderBy) params = params.append('orderBy', orderBy!);
    params = params.append('take', take.toString());
    params = params.append('page', page.toString());
    params = params.append('relations', 'logo');
    if(text) params = params.append('text', `name:${text}`);
    if(status) params = params.append('status', status!);

    return this.http.get<any>(`${environment.apiEndpoint}/providers`, { params: params })
      .pipe(map(response => {
        return response;
      }));
  }
  updateProvider(providerId: string, data: any){
    return this.http.put<any>(`${environment.apiEndpoint}/admin/providers/edit/${providerId}`, data)
      .pipe(map(response => {
        return response;
      }));
  }
  addProvider(data: any){
    return this.http.post<any>(`${environment.apiEndpoint}/admin/providers/add/`, data)
      .pipe(map(response => {
        return response;
      }));
  }
  getProviderDetails(providerId: string){
    return this.http.get<any>(`${environment.apiEndpoint}/providers/getDetails/${providerId}`)
      .pipe(map(response => {
        return response;
      }));
  }

  getAllActiveProviders(status: number, relations?: string) {
    let params = new HttpParams();
    params = params.append('take', 100);
    if(status) params = params.append('status', 1);
    if(relations) params = params.append('relations', relations);

    return this.http.get<any>(`${environment.apiEndpoint}/providers`, { params: params })
      .pipe(map(response => {
        return response;
      }));
  }
}
