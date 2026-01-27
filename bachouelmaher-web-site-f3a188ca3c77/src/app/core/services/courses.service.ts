import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {map} from "rxjs";
import {SortConfig} from "../models/config.model";

@Injectable({
  providedIn: 'root'
})
export class CoursesService {
  constructor(private http: HttpClient) {}
  getAllCourses(sort : SortConfig, take: number, page: number, text?: string, status?: string, relations?: string, paid?: string, comingSoon?: string) {
    let orderBy = sort && sort.column && sort.direction ? `${sort.column}:${sort.direction}` : null;
    let params = new HttpParams();
    if(orderBy) params = params.append('orderBy', orderBy!);
    params = params.append('take', take.toString());
    params = params.append('page', page.toString());
    if(text) params = params.append('text', `title:${text}`);
    if(status) params = params.append('status', status!);
    if(relations) params = params.append('relations', relations);
    else params = params.append('relations', 'category,preview,provider,provider.logo');

    if(paid) params = params.append('paid', paid);
    if(comingSoon) params = params.append('comingSoon', comingSoon);

    return this.http.get<any>(`${environment.apiEndpoint}/admin/courses`, { params: params })
      .pipe(map(response => {
        return response;
      }));
  }
  updateCourse(courseId: string, data: any){
    return this.http.put<any>(`${environment.apiEndpoint}/admin/courses/edit/${courseId}`, data)
      .pipe(map(response => {
        return response;
      }));
  }
  addCourse(data: any){
    return this.http.post<any>(`${environment.apiEndpoint}/admin/courses/add/`, data)
      .pipe(map(response => {
        return response;
      }));
  }
  getCourseDetails(courseId: string){
    return this.http.get<any>(`${environment.apiEndpoint}/admin/courses/getDetails/${courseId}`)
      .pipe(map(response => {
        return response;
      }));
  }
  deleteRequirement(requirementId: string){
    return this.http.delete<any>(`${environment.apiEndpoint}/admin/courses/deleteRequirement/${requirementId}`)
      .pipe(map(response => {
        return response;
      }));
  }
  deleteFaq(faqId: string){
    return this.http.delete<any>(`${environment.apiEndpoint}/admin/courses/deleteFaq/${faqId}`)
      .pipe(map(response => {
        return response;
      }));
  }
  getUserEnrollCourse(courseId: string, sort : SortConfig, take: number, page: number, pharmacy? : string){
    let orderBy = sort && sort.column && sort.direction ? `${sort.column}:${sort.direction}` : null;
    let params = new HttpParams();
    if(orderBy) params = params.append('orderBy', orderBy!);
    if(pharmacy) params = params.append('pharmacy', `${pharmacy}`);
    params = params.append('take', take.toString());
    params = params.append('page', page.toString());
    return this.http.get<any>(`${environment.apiEndpoint}/admin/courses/getEnrollCourse/${courseId}`, { params: params })
      .pipe(map(response => {
        return response;
      }));
  }
  deleteInclude(includeId: string){
    return this.http.delete<any>(`${environment.apiEndpoint}/admin/courses/deleteInclude/${includeId}`)
      .pipe(map(response => {
        return response;
      }));
  }
  deleteObjective(objectiveId: string){
    return this.http.delete<any>(`${environment.apiEndpoint}/admin/courses/deleteObjective/${objectiveId}`)
      .pipe(map(response => {
        return response;
      }));
  }
  deleteLesson(lessonId: string){
    return this.http.delete<any>(`${environment.apiEndpoint}/admin/courses/deleteLesson/${lessonId}`)
      .pipe(map(response => {
        return response;
      }));
  }

  getAllActiveCourses(take?: number) {
    let params = new HttpParams();
    if(take) params = params.append('take', take.toString());
    return this.http.get<any>(`${environment.apiEndpoint}/courses`, { params: params })
      .pipe(map(response => {
        return response;
      }));
  }

  getActiveCourseDetails(courseId: string){
    return this.http.get<any>(`${environment.apiEndpoint}/courses/getDetails/${courseId}`)
      .pipe(map(response => {
        return response;
      }));
  }

  getEnrollCourse(courseId: string){
    return this.http.get<any>(`${environment.apiEndpoint}/courses/enrollCourse/${courseId}`)
      .pipe(map(response => {
        return response;
      }));
  }

  getDetailsEnrollCourse(courseId: string){
    return this.http.get<any>(`${environment.apiEndpoint}/courses/detailsEnrollCourse/${courseId}`)
      .pipe(map(response => {
        return response;
      }));
  }

  updateEnrollCourse(EnrollCourseId: string, data: any){
    return this.http.post<any>(`${environment.apiEndpoint}/courses/updateEnrollCourse/${EnrollCourseId}`, data)
      .pipe(map(response => {
        return response;
      }));
  }


  getAllCoursesWithCatgorieOrProvider(categorieId?: string, providerId?: string) {
    const url = `${environment.apiEndpoint}/courses`;

    const params: any = {};
    if (categorieId) params.category = categorieId;
    if (providerId) params.provider = providerId;

    return this.http.get<any>(url, { params }).pipe(
      map(response => response)
    );
  }

  questionEnrollCourse(EnrollCourseId: string, data: any){
    return this.http.post<any>(`${environment.apiEndpoint}/courses/questionEnrollCourse/${EnrollCourseId}`, data)
      .pipe(map(response => {
        return response;
      }));
  }

  regenerateQuestionEnrollCourse(EnrollCourseId: string, data: any){
    return this.http.post<any>(`${environment.apiEndpoint}/courses/regenerateQuestionEnrollCourse/${EnrollCourseId}`, data)
      .pipe(map(response => {
        return response;
      }));
  }

  answerQuestionEnrollCourse(EnrollCourseId: string, data: any){
    return this.http.post<any>(`${environment.apiEndpoint}/courses/answerQuestionEnrollCourse/${EnrollCourseId}`, data)
      .pipe(map(response => {
        return response;
      }));
  }

  answerQuestionEnrollCourseDetails(EnrollCourseId: string, data: any){
    return this.http.post<any>(`${environment.apiEndpoint}/courses/answerQuestionEnrollCourseDetails/${EnrollCourseId}`, data)
      .pipe(map(response => {
        return response;
      }));
  }

}
