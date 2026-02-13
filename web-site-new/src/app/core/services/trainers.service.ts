import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {SortConfig} from "../models/config.model";
import {environment} from "../../../environments/environment";
import {map} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class TrainersService {
  constructor(private http: HttpClient) {
  }
  getAllTrainers(sort : SortConfig, take: number, page: number, text?: string, status?: string, providers?: string) {
    let orderBy = sort && sort.column && sort.direction ? `${sort.column}:${sort.direction}` : null;
    let params = new HttpParams();
    if(orderBy) params = params.append('orderBy', orderBy!);
    params = params.append('take', take.toString());
    params = params.append('page', page.toString());
    params = params.append('relations', 'providers,image');
    if(text) params = params.append('text', `name:${text}`);
    if(status) params = params.append('status', status!);
    if(providers) params = params.append('providers', providers!);

    return this.http.get<any>(`${environment.apiEndpoint}/trainers`, { params: params })
      .pipe(map(response => {
        return response;
      }));
  }
  updateTrainer(trainerId: string, data: any){
    return this.http.put<any>(`${environment.apiEndpoint}/admin/trainers/edit/${trainerId}`, data)
      .pipe(map(response => {
        return response;
      }));
  }
  addTrainer(data: any){
    return this.http.post<any>(`${environment.apiEndpoint}/admin/trainers/add/`, data)
      .pipe(map(response => {
        return response;
      }));
  }
  getTrainerDetails(trainerId: string){
    return this.http.get<any>(`${environment.apiEndpoint}/trainers/getDetails/${trainerId}`)
      .pipe(map(response => {
        return response;
      }));
  }

  getAllActiveTrainers(status: string) {
    let params = new HttpParams();
    params = params.append('take', 20);
    params = params.append('relations', 'logo');
    if(status) params = params.append('status', status!);

    return this.http.get<any>(`${environment.apiEndpoint}/trainers`, { params: params })
      .pipe(map(response => {
        return response;
      }));
  }
}
