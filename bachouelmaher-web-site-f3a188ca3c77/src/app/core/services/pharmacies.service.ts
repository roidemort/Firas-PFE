import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {map} from "rxjs";
import {SortConfig} from "../models/config.model";

@Injectable({
  providedIn: 'root'
})
export class PharmaciesService {
  constructor(private http: HttpClient) {

  }
  getAllPharmacies(sort : SortConfig, take: number, page: number, text?: string, status?: string) {
    let orderBy = sort && sort.column && sort.direction ? `${sort.column}:${sort.direction}` : null;
    let params = new HttpParams();
    if(orderBy) params = params.append('orderBy', orderBy!);
    params = params.append('take', take.toString());
    params = params.append('page', page.toString());
    if(text) params = params.append('text', `name,tel:${text}`);
    if(status) params = params.append('status', status!);

    return this.http.get<any>(`${environment.apiEndpoint}/admin/pharmacies`, { params: params })
      .pipe(map(response => {
        return response;
      }));
  }
  updatePharmacy(pharmacyId: string, data: any){
    return this.http.put<any>(`${environment.apiEndpoint}/admin/pharmacies/edit/${pharmacyId}`, data)
      .pipe(map(response => {
        return response;
      }));
  }

  addPharmacy(data: any){
    return this.http.post<any>(`${environment.apiEndpoint}/admin/pharmacies/add/`, data)
      .pipe(map(response => {
        return response;
      }));
  }

  getPharmacyDetails(pharmacyId: string){
    return this.http.get<any>(`${environment.apiEndpoint}/admin/pharmacies/getDetails/${pharmacyId}`)
      .pipe(map(response => {
        return response;
      }));
  }
  getAllKeys(sort : SortConfig, pharmacyId: string, take: number, page: number, text?: string, status?: string){
    let orderBy = sort && sort.column && sort.direction ? `${sort.column}:${sort.direction}` : null;
    let params = new HttpParams();
    if(orderBy) params = params.append('orderBy', orderBy!);
    params = params.append('take', take.toString());
    params = params.append('page', page.toString());
    params = params.append('relations', 'user');
    if(text) params = params.append('text', `key:${text}`);
    if(status) params = params.append('status', status!);
    if(pharmacyId) params = params.append('pharmacy', pharmacyId!);

    return this.http.get<any>(`${environment.apiEndpoint}/admin/pharmacies-users/getAllKeys`, { params: params })
      .pipe(map(response => {
        return response;
      }));
  }

  generateNewKey(pharmacyId: string, role: string){
    return this.http.post<any>(`${environment.apiEndpoint}/admin/pharmacies-users/generateNewKey`, { pharmacyId: pharmacyId, role: role })
      .pipe(map(response => {
        return response;
      }));
  }
  updateKey(key: string, status: number){
    return this.http.post<any>(`${environment.apiEndpoint}/admin/pharmacies-users/updateKey`, { key: key, status: status })
      .pipe(map(response => {
        return response;
      }));
  }

  getAllActivePharmacies(status?: string) {
    let params = new HttpParams();
    if(status) params = params.append('status', status!);

    return this.http.get<any>(`${environment.apiEndpoint}/pharmacies`, { params: params })
      .pipe(map(response => {
        return response;
      }));
  }

}


