import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {map} from "rxjs";
import {SortConfig} from "../models/config.model";

@Injectable({
  providedIn: 'root'
})
export class RatingsService {
  constructor(private http: HttpClient) {}
  getAllRatings(courseId: string, sort : SortConfig, take: number, page: number, status?: string) {
    let orderBy = sort && sort.column && sort.direction ? `${sort.column}:${sort.direction}` : null;
    let params = new HttpParams();
    if(orderBy) params = params.append('orderBy', orderBy!);
    params = params.append('take', take.toString());
    params = params.append('page', page.toString());
    params = params.append('relations', 'user');

    if(status) params = params.append('status', status!);

    return this.http.get<any>(`${environment.apiEndpoint}/admin/ratings/${courseId}`, { params: params })
      .pipe(map(response => {
        return response;
      }));
  }
  updateRating(ratingId: string, data: any){
    return this.http.put<any>(`${environment.apiEndpoint}/admin/ratings/edit/${ratingId}`, data)
      .pipe(map(response => {
        return response;
      }));
  }


  getAllActiveRatings(courseId: string) {
    return this.http.post<any>(`${environment.apiEndpoint}/ratings/getRatings`, { courseId: courseId })
      .pipe(map(response => {
        return response;
    }));
  }

  addRating(data: any){
    return this.http.post<any>(`${environment.apiEndpoint}/ratings/addRating`, data)
      .pipe(map(response => {
        return response;
      }));
  }


}


