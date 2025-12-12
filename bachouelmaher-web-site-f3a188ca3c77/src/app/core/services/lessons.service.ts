import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {map} from "rxjs";
import {SortConfig} from "../models/config.model";

@Injectable({
  providedIn: 'root'
})
export class LessonsService {
  constructor(private http: HttpClient) {}
  getAllLesson(sort : SortConfig, take: number, page: number, text?: string, status?: string, course?: string, section?: string) {
    let orderBy = sort && sort.column && sort.direction ? `${sort.column}:${sort.direction}` : null;
    let params = new HttpParams();
    if(orderBy) params = params.append('orderBy', orderBy!);
    params = params.append('take', take.toString());
    params = params.append('page', page.toString());
    params = params.append('relations', 'section,section.course');
    if(text) params = params.append('text', `title:${text}`);
    if(status) params = params.append('status', status!);
    if(course) params = params.append('course', course!);
    if(course && section) params = params.append('section', section!);

    return this.http.get<any>(`${environment.apiEndpoint}/admin/lessons`, { params: params })
      .pipe(map(response => {
        return response;
      }));
  }
  updateLesson(lessonId: string, data: any){
    return this.http.put<any>(`${environment.apiEndpoint}/admin/lessons/edit/${lessonId}`, data)
      .pipe(map(response => {
        return response;
      }));
  }
  addLesson(data: any){
    return this.http.post<any>(`${environment.apiEndpoint}/admin/lessons/add/`, data)
      .pipe(map(response => {
        return response;
      }));
  }
  getLessonDetails(lessonId: string){
    return this.http.get<any>(`${environment.apiEndpoint}/admin/lessons/getDetails/${lessonId}`)
      .pipe(map(response => {
        return response;
      }));
  }
}


