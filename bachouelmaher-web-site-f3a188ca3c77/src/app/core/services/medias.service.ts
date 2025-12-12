import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {map} from "rxjs";
import {SortConfig} from "../models/config.model";

@Injectable({
  providedIn: 'root'
})
export class MediasService {
  constructor(private http: HttpClient) {

  }
  getAllImages(sort : SortConfig, take: number, page: number, text?: string, status?: string) {
    let orderBy = sort && sort.column && sort.direction ? `${sort.column}:${sort.direction}` : null;
    let params = new HttpParams();
    if(orderBy) params = params.append('orderBy', orderBy!);
    params = params.append('take', take.toString());
    params = params.append('page', page.toString());
    if(text) params = params.append('text', `filename:${text}`);
    if(status) params = params.append('status', status!);

    return this.http.get<any>(`${environment.apiEndpoint}/admin/images`, { params: params })
      .pipe(map(response => {
        return response;
      }));
  }
  addImage(file: File) {
    const formData = new FormData();
    formData.append('upload', file);
    return this.http.post<any>(`${environment.apiEndpoint}/admin/images/add`, formData)
      .pipe(map(response => {
        return response;
      }));
  }
  removeImages(filesIds: Array<string>) {
    return this.http.post<any>(`${environment.apiEndpoint}/admin/images/remove`, { imagesIds: filesIds })
      .pipe(map(response => {
        return response;
      }));
  }

}


