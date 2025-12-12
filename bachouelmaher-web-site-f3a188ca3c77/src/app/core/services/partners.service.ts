import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {SortConfig} from "../models/config.model";
import {environment} from "../../../environments/environment";
import {map} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class PartnersService {
  constructor(private http: HttpClient) {
  }
  getAllPartners(sort : SortConfig, take: number, page: number, text?: string, status?: string) {
    let orderBy = sort && sort.column && sort.direction ? `${sort.column}:${sort.direction}` : null;
    let params = new HttpParams();
    if(orderBy) params = params.append('orderBy', orderBy!);
    params = params.append('take', take.toString());
    params = params.append('page', page.toString());
    params = params.append('relations', 'logo');
    if(text) params = params.append('text', `name:${text}`);
    if(status) params = params.append('status', status!);

    return this.http.get<any>(`${environment.apiEndpoint}/partners`, { params: params })
      .pipe(map(response => {
        return response;
      }));
  }
  updatePartner(partnerId: string, data: any){
    return this.http.put<any>(`${environment.apiEndpoint}/admin/partners/edit/${partnerId}`, data)
      .pipe(map(response => {
        return response;
      }));
  }
  addPartner(data: any){
    return this.http.post<any>(`${environment.apiEndpoint}/admin/partners/add/`, data)
      .pipe(map(response => {
        return response;
      }));
  }
  getPartnerDetails(partnerId: string){
    return this.http.get<any>(`${environment.apiEndpoint}/partners/getDetails/${partnerId}`)
      .pipe(map(response => {
        return response;
      }));
  }

  getAllActivePartners(status: string) {
    let params = new HttpParams();
    params = params.append('take', 20);
    params = params.append('relations', 'logo');
    if(status) params = params.append('status', status!);

    return this.http.get<any>(`${environment.apiEndpoint}/partners`, { params: params })
      .pipe(map(response => {
        return response;
      }));
  }
}
