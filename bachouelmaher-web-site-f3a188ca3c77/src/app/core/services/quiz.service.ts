import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {map} from "rxjs";
import {SortConfig} from "../models/config.model";

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  constructor(private http: HttpClient) {}
  getAllQuiz(sort : SortConfig, take: number, page: number, text?: string, status?: string, course?: string, section?: string) {
    let orderBy = sort && sort.column && sort.direction ? `${sort.column}:${sort.direction}` : null;
    let params = new HttpParams();
    if(orderBy) params = params.append('orderBy', orderBy!);
    params = params.append('take', take.toString());
    params = params.append('page', page.toString());
    params = params.append('relations', 'questions,section,section.course');
    if(text) params = params.append('text', `title:${text}`);
    if(status) params = params.append('status', status!);
    if(course) params = params.append('course', course!);
    if(course && section) params = params.append('section', section!);

    return this.http.get<any>(`${environment.apiEndpoint}/admin/quiz`, { params: params })
      .pipe(map(response => {
        return response;
      }));
  }
  updateQuiz(quizId: string, data: any){
    return this.http.put<any>(`${environment.apiEndpoint}/admin/quiz/edit/${quizId}`, data)
      .pipe(map(response => {
        return response;
      }));
  }
  getQuizDetails(quizId: string){
    return this.http.get<any>(`${environment.apiEndpoint}/admin/quiz/getDetails/${quizId}`)
      .pipe(map(response => {
        return response;
      }));
  }
}


