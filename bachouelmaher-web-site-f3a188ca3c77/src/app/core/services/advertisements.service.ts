import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {SortConfig} from "../models/config.model";
import {environment} from "../../../environments/environment";
import {map} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AdvertisementsService {
  constructor(private http: HttpClient) {
  }
  getAllAdvertisements(sort : SortConfig, take: number, page: number, text?: string, status?: string, type?: string) {
    let orderBy = sort && sort.column && sort.direction ? `${sort.column}:${sort.direction}` : null;
    let params = new HttpParams();
    if(orderBy) params = params.append('orderBy', orderBy!);
    params = params.append('take', take.toString());
    params = params.append('page', page.toString());
    if(text) params = params.append('text', `title:${text}`);
    if(status) params = params.append('status', status!);
    if(type) params = params.append('type', type!);

    return this.http.get<any>(`${environment.apiEndpoint}/advertisements`, { params: params })
      .pipe(map(response => {
        return response;
      }));
  }
  updateAdvertisement(advertisementId: string, data: any){
    return this.http.put<any>(`${environment.apiEndpoint}/admin/advertisements/edit/${advertisementId}`, data)
      .pipe(map(response => {
        return response;
      }));
  }
  updateAdvertisementStatus(advertisementId: string, data: any){
    return this.http.put<any>(`${environment.apiEndpoint}/admin/advertisements/editStatus/${advertisementId}`, data)
      .pipe(map(response => {
        return response;
      }));
  }
  addAdvertisement(data: any){
    return this.http.post<any>(`${environment.apiEndpoint}/admin/advertisements/add/`, data)
      .pipe(map(response => {
        return response;
      }));
  }
  getAdvertisementDetails(advertisementId: string){
    return this.http.get<any>(`${environment.apiEndpoint}/advertisements/getDetails/${advertisementId}`)
      .pipe(map(response => {
        return response;
      }));
  }

  getAllActiveAdvertisements(status?: string) {
    let params = new HttpParams();
    if(status) params = params.append('status', status!);

    return this.http.get<any>(`${environment.apiEndpoint}/advertisements`, { params: params })
      .pipe(map(response => {
        return response;
      }));
  }
}
