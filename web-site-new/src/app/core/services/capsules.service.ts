import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {SortConfig} from "../models/config.model";
import {environment} from "../../../environments/environment";
import {map} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class CapsulesService {
  constructor(private http: HttpClient) {
  }
  getAllCapsules(sort : SortConfig, take: number, page: number, text?: string, status?: string) {
    let orderBy = sort && sort.column && sort.direction ? `${sort.column}:${sort.direction}` : null;
    let params = new HttpParams();
    if(orderBy) params = params.append('orderBy', orderBy!);
    params = params.append('take', take.toString());
    params = params.append('page', page.toString());
    params = params.append('relations', 'category,provider');
    if(text) params = params.append('text', `title:${text}`);
    if(status) params = params.append('status', status!);

    return this.http.get<any>(`${environment.apiEndpoint}/capsules`, { params: params })
      .pipe(map(response => {
        return response;
      }));
  }
  updateCapsule(capsuleId: string, data: any){
    return this.http.put<any>(`${environment.apiEndpoint}/admin/capsules/edit/${capsuleId}`, data)
      .pipe(map(response => {
        return response;
      }));
  }
  addCapsule(data: any){
    return this.http.post<any>(`${environment.apiEndpoint}/admin/capsules/add/`, data)
      .pipe(map(response => {
        return response;
      }));
  }
  getCapsuleDetails(capsuleId: string){
    return this.http.get<any>(`${environment.apiEndpoint}/capsules/getDetails/${capsuleId}`)
      .pipe(map(response => {
        return response;
      }));
  }

  getAllActiveCapsules(status?: string) {
    let params = new HttpParams();
    params = params.append('relations', 'category,provider');
    if(status) params = params.append('status', status!);

    return this.http.get<any>(`${environment.apiEndpoint}/capsules`, { params: params })
      .pipe(map(response => {
        return response;
      }));
  }

  getAllCapsulesWithCatgorieOrProvider(categorieId?: string, providerId?: string) {
    const url = `${environment.apiEndpoint}/capsules`;

    const params: any = {};
    if (categorieId) params.category = categorieId;
    if (providerId) params.provider = providerId;
  
    return this.http.get<any>(url, { params }).pipe(
      map(response => response)
    );
  }
}
