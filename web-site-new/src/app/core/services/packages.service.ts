import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {SortConfig} from "../models/config.model";
import {environment} from "../../../environments/environment";
import {map} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class PackagesService {
  constructor(private http: HttpClient) {
  }
  getAllPackages(sort : SortConfig, take: number, page: number, text?: string, status?: string) {
    let orderBy = sort && sort.column && sort.direction ? `${sort.column}:${sort.direction}` : null;
    let params = new HttpParams();
    if(orderBy) params = params.append('orderBy', orderBy!);
    params = params.append('take', take.toString());
    params = params.append('page', page.toString());
    if(text) params = params.append('text', `name:${text}`);
    if(status) params = params.append('status', status!);

    return this.http.get<any>(`${environment.apiEndpoint}/packages`, { params: params })
      .pipe(map(response => {
        return response;
      }));
  }
  updatePackage(packageId: string, data: any){
    return this.http.put<any>(`${environment.apiEndpoint}/admin/packages/edit/${packageId}`, data)
      .pipe(map(response => {
        return response;
      }));
  }
  addPackage(data: any){
    return this.http.post<any>(`${environment.apiEndpoint}/admin/packages/add/`, data)
      .pipe(map(response => {
        return response;
      }));
  }
  getPackageDetails(packageId: string){
    return this.http.get<any>(`${environment.apiEndpoint}/packages/getDetails/${packageId}`)
      .pipe(map(response => {
        return response;
      }));
  }

  getAllActivePackages(status: string) {
    let params = new HttpParams();
    params = params.append('take', 20);
   //params = params.append('relations', 'logo');
    if(status) params = params.append('status', status!);

    return this.http.get<any>(`${environment.apiEndpoint}/packages`, { params: params })
      .pipe(map(response => {
        return response;
      }));
  }
}
