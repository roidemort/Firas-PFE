import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {SortConfig} from "../models/config.model";
import {environment} from "../../../environments/environment";
import {map} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {
  constructor(private http: HttpClient) {
  }
  getAllCategories() {
    return this.http.get<any>(`${environment.apiEndpoint}/categories`)
      .pipe(map(response => {
        return response;
      }));
  }
  getAllCategoriesTree() {
    return this.http.get<any>(`${environment.apiEndpoint}/categories/getAllTree`)
      .pipe(map(response => {
        return response;
      }));
  }
  updateCategory(categoryId: string, data: any){
    return this.http.put<any>(`${environment.apiEndpoint}/admin/categories/edit/${categoryId}`, data)
      .pipe(map(response => {
        return response;
      }));
  }
  addCategory(data: any){
    return this.http.post<any>(`${environment.apiEndpoint}/admin/categories/add/`, data)
      .pipe(map(response => {
        return response;
      }));
  }
  getCategoryDetails(categoryId: string){
    return this.http.get<any>(`${environment.apiEndpoint}/categories/getDetails/${categoryId}`)
      .pipe(map(response => {
        return response;
      }));
  }

  getAllActiveCategories(status: string) {
    let params = new HttpParams();
    params = params.append('take', 20);
    params = params.append('relations', 'logo');
    if(status) params = params.append('status', status!);

    return this.http.get<any>(`${environment.apiEndpoint}/categories`, { params: params })
      .pipe(map(response => {
        return response;
      }));
  }

  getAllWithProviders(){
    return this.http.get<any>(`${environment.apiEndpoint}/categories/getAllWithProviders`)
    .pipe(map(response => {
      return response;
    }));
  }



  


}
