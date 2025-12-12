import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {map} from "rxjs";
import {SortConfig} from "../models/config.model";

@Injectable({
  providedIn: 'root'
})
export class QuestionsService {
  constructor(private http: HttpClient) {}
  getAllQuestions(sort : SortConfig, take: number, page: number, text?: string, status?: string, course?: string, section?: string) {
    let orderBy = sort && sort.column && sort.direction ? `${sort.column}:${sort.direction}` : null;
    let params = new HttpParams();
    if(orderBy) params = params.append('orderBy', orderBy!);
    params = params.append('take', take.toString());
    params = params.append('page', page.toString());
    if(text) params = params.append('text', `text,topic:${text}`);
    if(status) params = params.append('status', status!);
    if(course) params = params.append('course', course!);
    if(course && section) params = params.append('section', section!);

    return this.http.get<any>(`${environment.apiEndpoint}/admin/questions`, { params: params })
      .pipe(map(response => {
        return response;
      }));
  }
  updateQuestion(questionId: string, data: any){
    return this.http.put<any>(`${environment.apiEndpoint}/admin/questions/edit/${questionId}`, data)
      .pipe(map(response => {
        return response;
      }));
  }
  addQuestion(data: any){
    return this.http.post<any>(`${environment.apiEndpoint}/admin/questions/add/`, data)
      .pipe(map(response => {
        return response;
      }));
  }
  getQuestionDetails(questionId: string){
    return this.http.get<any>(`${environment.apiEndpoint}/admin/questions/getDetails/${questionId}`)
      .pipe(map(response => {
        return response;
      }));
  }
}


