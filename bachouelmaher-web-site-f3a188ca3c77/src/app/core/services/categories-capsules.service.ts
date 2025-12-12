import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {SortConfig} from "../models/config.model";
import {environment} from "../../../environments/environment";
import {map} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class CategoriesCapsulesService {
  constructor(private http: HttpClient) {
  }
  getAllCategoriesTree() {
    return this.http.get<any>(`${environment.apiEndpoint}/categories-capsules/getAllTree`)
      .pipe(map(response => {
        return response;
      }));
  }
  updateCategory(categoryId: string, data: any){
    return this.http.put<any>(`${environment.apiEndpoint}/admin/categories-capsules/edit/${categoryId}`, data)
      .pipe(map(response => {
        return response;
      }));
  }
  addCategory(data: any){
    return this.http.post<any>(`${environment.apiEndpoint}/admin/categories-capsules/add/`, data)
      .pipe(map(response => {
        return response;
      }));
  }
  getCategoryDetails(categoryId: string){
    return this.http.get<any>(`${environment.apiEndpoint}/categories-capsules/getDetails/${categoryId}`)
      .pipe(map(response => {
        return response;
      }));
  }

  getAllWithProviders(){
    return this.http.get<any>(`${environment.apiEndpoint}/categories-capsules/getAllWithProviders`)
    .pipe(map(response => {
      return response;
    }));
  }
}
