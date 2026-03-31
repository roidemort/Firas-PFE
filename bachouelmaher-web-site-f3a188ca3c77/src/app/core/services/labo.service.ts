import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {map} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class LaboService {

  constructor(private http: HttpClient) {}

  loginLabo(email: string, password: string) {
    return this.http.post<any>(`${environment.apiEndpoint}/labo/auth/login`, { email, password })
      .pipe(map(r => r));
  }

  getMyProducts(take = 20, page = 1, status?: string) {
    let params = new HttpParams().append('take', take).append('page', page);
    if (status !== undefined && status !== '') params = params.append('status', status);
    return this.http.get<any>(`${environment.apiEndpoint}/labo/products`, { params }).pipe(map(r => r));
  }

  addProduct(data: any) {
    return this.http.post<any>(`${environment.apiEndpoint}/labo/products/add`, data).pipe(map(r => r));
  }

  editProduct(productId: string, data: any) {
    return this.http.put<any>(`${environment.apiEndpoint}/labo/products/edit/${productId}`, data).pipe(map(r => r));
  }

  getProductDetails(productId: string) {
    return this.http.get<any>(`${environment.apiEndpoint}/labo/products/details/${productId}`).pipe(map(r => r));
  }

  getMyOrders(take = 20, page = 1, status?: string) {
    let params = new HttpParams().append('take', take).append('page', page);
    if (status !== undefined && status !== '') params = params.append('status', status);
    return this.http.get<any>(`${environment.apiEndpoint}/labo/orders`, { params }).pipe(map(r => r));
  }

  updateOrderStatus(orderId: string, status: number) {
    return this.http.put<any>(`${environment.apiEndpoint}/labo/orders/status/${orderId}`, { status }).pipe(map(r => r));
  }

  getMyCourses() {
    return this.http.get<any>(`${environment.apiEndpoint}/labo/courses`).pipe(map(r => r));
  }

  getMyCourseDetails(courseId: string) {
    return this.http.get<any>(`${environment.apiEndpoint}/labo/courses/details/${courseId}`).pipe(map(r => r));
  }

  getMyCourseAnalytics(courseId: string) {
    return this.http.get<any>(`${environment.apiEndpoint}/labo/courses/${courseId}/analytics`).pipe(map(r => r));
  }

  getMyCourseStats(courseIds?: string[]) {
    let params = new HttpParams();
    if (courseIds && courseIds.length) {
      params = params.append('courseIds', courseIds.join(','));
    }

    return this.http.get<any>(`${environment.apiEndpoint}/labo/courses/stats`, { params }).pipe(map(r => r));
  }

  getMySuggestions(courseId?: string, status?: string) {
    let params = new HttpParams();
    if (courseId) params = params.append('courseId', courseId);
    if (status) params = params.append('status', status);
    return this.http.get<any>(`${environment.apiEndpoint}/labo/suggestions`, { params }).pipe(map(r => r));
  }

  createSuggestion(data: any) {
    return this.http.post<any>(`${environment.apiEndpoint}/labo/suggestions`, data).pipe(map(r => r));
  }

  updateSuggestion(suggestionId: string, data: any) {
    return this.http.put<any>(`${environment.apiEndpoint}/labo/suggestions/${suggestionId}`, data).pipe(map(r => r));
  }

  getMyChatQuestions(tab: 'unanswered' | 'answered' | 'all' = 'unanswered', courseId?: string) {
    let params = new HttpParams().append('tab', tab);
    if (courseId) {
      params = params.append('courseId', courseId);
    }

    return this.http.get<any>(`${environment.apiEndpoint}/labo/chat/questions`, { params }).pipe(map(r => r));
  }

  getMyChatQuestionDetails(questionId: string) {
    return this.http.get<any>(`${environment.apiEndpoint}/labo/chat/questions/${questionId}`).pipe(map(r => r));
  }

  getMyChatUnansweredCount(courseId?: string) {
    let params = new HttpParams();
    if (courseId) {
      params = params.append('courseId', courseId);
    }

    return this.http
      .get<any>(`${environment.apiEndpoint}/labo/chat/questions/count-unanswered`, { params })
      .pipe(map(r => r));
  }

  replyToMyChatQuestion(questionId: string, content: string, visibility: 'public' | 'private') {
    return this.http
      .post<any>(`${environment.apiEndpoint}/labo/chat/questions/${questionId}/reply`, { content, visibility })
      .pipe(map(r => r));
  }
}
