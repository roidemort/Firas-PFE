import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {map} from "rxjs";
import {SortConfig} from "../models/config.model";

@Injectable({
  providedIn: 'root'
})
export class CertificatesService {
  constructor(private http: HttpClient) {}
  getAllCertificates(sort : SortConfig, take: number, page: number, text?: string, status?: string) {
    let orderBy = sort && sort.column && sort.direction ? `${sort.column}:${sort.direction}` : null;
    let params = new HttpParams();
    if(orderBy) params = params.append('orderBy', orderBy!);
    params = params.append('take', take.toString());
    params = params.append('page', page.toString());
    params = params.append('relations', 'background,signature');
    if(text) params = params.append('text', `name:${text}`);
    if(status) params = params.append('status', status!);

    return this.http.get<any>(`${environment.apiEndpoint}/admin/certificates`, { params: params })
      .pipe(map(response => {
        return response;
      }));
  }
  updateCertificate(certificateId: string, data: any){
    return this.http.put<any>(`${environment.apiEndpoint}/admin/certificates/edit/${certificateId}`, data)
      .pipe(map(response => {
        return response;
      }));
  }
  addCertificate(data: any){
    return this.http.post<any>(`${environment.apiEndpoint}/admin/certificates/add/`, data)
      .pipe(map(response => {
        return response;
      }));
  }
  getCertificateDetails(certificateId: string){
    return this.http.get<any>(`${environment.apiEndpoint}/admin/certificates/getDetails/${certificateId}`)
      .pipe(map(response => {
        return response;
      }));
  }

  getMyCertificate(coursId: string){
    return this.http.get<any>(`${environment.apiEndpoint}/user/getMyCertificate/${coursId}`)
      .pipe(map(response => {
        return response;
      }));
  }

  downloadFile(url: string) {
    return this.http.get(url, { responseType: 'blob' }); // Récupère le fichier sous forme de Blob
  }
}


