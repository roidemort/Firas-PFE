import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {BehaviorSubject, map, Observable} from "rxjs";
import {SortConfig} from "../models/config.model";

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  private userUpdated = new BehaviorSubject<string>('');
  userUpdate$ = this.userUpdated.asObservable();

  constructor(private http: HttpClient) {

  }
  setUserUpdate(isUpdated : string){
    this.userUpdated.next(isUpdated);
  }

  getMainDashboardDetails(){
    return this.http.get<any>(`${environment.apiEndpoint}/admin/dashboard`)
      .pipe(map(response => {
        return response;
      }));
  }
  getAllUsers(sort : SortConfig, take: number, page: number, text?: string, role?: string, status?: string, gender?: string) {
    let orderBy = sort && sort.column && sort.direction ? `${sort.column}:${sort.direction}` : null;
    let params = new HttpParams();
    if(orderBy) params = params.append('orderBy', orderBy!);
    params = params.append('take', take.toString());
    params = params.append('page', page.toString());
    if(text) params = params.append('text', `email,firstName,lastName:${text}`);
    if(role) params = params.append('role', role!);
    if(status) params = params.append('status', status!);
    if(gender) params = params.append('gender', gender!);

    return this.http.get<any>(`${environment.apiEndpoint}/admin/users`, { params: params })
      .pipe(map(response => {
        return response;
      }));
  }
  updateUser(userId: string, data: any){
    return this.http.put<any>(`${environment.apiEndpoint}/admin/users/edit/${userId}`, data)
      .pipe(map(response => {
        return response;
      }));
  }
  addUser(data: any){
    return this.http.post<any>(`${environment.apiEndpoint}/admin/users/add`, data)
      .pipe(map(response => {
        return response;
      }));
  }

  sendNotifications(data: any){
    return this.http.post<any>(`${environment.apiEndpoint}/admin/users/sendNotifications`, data)
      .pipe(map(response => {
        return response;
      }));
  }

  updateProfile(data: any) {
    return this.http.put<any>(`${environment.apiEndpoint}/user/edit-profile`, data);
  }
  updatePassword(data: any) {
    return this.http.put<any>(`${environment.apiEndpoint}/user/edit-password`, data);
  }
  getUserDetails(userId: string){
    let params = new HttpParams();
    params = params.append('relations', 'key,key.pharmacy');
    return this.http.get<any>(`${environment.apiEndpoint}/admin/users/details/${userId}`, { params: params })
      .pipe(map(response => {
        return response;
      }));
  }
  userCourseEnroll(userId: string, sort : SortConfig, take: number, page: number, status?: string){
    let orderBy = sort && sort.column && sort.direction ? `${sort.column}:${sort.direction}` : null;
    let params = new HttpParams();
    if(orderBy) params = params.append('orderBy', orderBy!);
    params = params.append('take', take.toString());
    params = params.append('page', page.toString());
    if(status) params = params.append('status', status!);
    params = params.append('relations', 'user,course');

    return this.http.get<any>(`${environment.apiEndpoint}/admin/users/courseEnroll/${userId}`, { params: params })
      .pipe(map(response => {
        return response;
      }));
  }
  userConversation(userId: string, courseId: string){
    let params = new HttpParams();
    params = params.append('take', 200);
    params = params.append('page', 1);

    return this.http.post<any>(`${environment.apiEndpoint}/admin/users/conversation`,{ userId, courseId }, { params: params })
      .pipe(map(response => {
        return response;
      }));
  }
  addConversation(userId: string, courseId: string, content: string){
    return this.http.post<any>(`${environment.apiEndpoint}/admin/users/add/conversation`,{ userId, courseId, content })
      .pipe(map(response => {
        return response;
      }));
  }
  countNotification(){
    return this.http.get<any>(`${environment.apiEndpoint}/admin/users/count/notifications`)
      .pipe(map(response => {
        return response;
      }));
  }
  countConversation(userId: string, courseId: string){
    return this.http.post<any>(`${environment.apiEndpoint}/admin/users/count/conversation`,{ userId, courseId })
      .pipe(map(response => {
        return response;
      }));
  }
  getChatRepliesModeration(status = 'ACTIVE', laboId?: string, courseId?: string, text?: string, take = 20, page = 1) {
    let params = new HttpParams();
    params = params.append('status', status);
    params = params.append('take', take.toString());
    params = params.append('page', page.toString());
    if (laboId) params = params.append('laboId', laboId);
    if (courseId) params = params.append('courseId', courseId);
    if (text) params = params.append('text', text);

    return this.http.get<any>(`${environment.apiEndpoint}/admin/chat/replies`, { params })
      .pipe(map(response => {
        return response;
      }));
  }
  hideChatReply(replyId: string) {
    return this.http.put<any>(`${environment.apiEndpoint}/admin/chat/replies/${replyId}/hide`, {})
      .pipe(map(response => {
        return response;
      }));
  }
  deleteChatReply(replyId: string) {
    return this.http.put<any>(`${environment.apiEndpoint}/admin/chat/replies/${replyId}/delete`, {})
      .pipe(map(response => {
        return response;
      }));
  }
  restoreChatReply(replyId: string) {
    return this.http.put<any>(`${environment.apiEndpoint}/admin/chat/replies/${replyId}/restore`, {})
      .pipe(map(response => {
        return response;
      }));
  }
  courseEnrollProgression(data: any){
    return this.http.post<any>(`${environment.apiEndpoint}/admin/users/courseEnrollProgression`, data)
      .pipe(map(response => {
        return response;
      }));
  }

  updateUserProfile(data: any){
    return this.http.put<any>(`${environment.apiEndpoint}/user/edit-profile`, data)
      .pipe(map(response => {
        return response;
      }));
  }

  getUserPlan(){
    return this.http.get<any>(`${environment.apiEndpoint}/user/getMyPlan`)
      .pipe(map(response => {
        return response;
      }));
  }

  getMyTeam(){
    return this.http.get<any>(`${environment.apiEndpoint}/user/getMyTeam`)
      .pipe(map(response => {
        return response;
      }));
  }

  getMyTeamByMonth(month: any){
    return this.http.get<any>(`${environment.apiEndpoint}/user/getMyTeam/${month}`)
      .pipe(map(response => {
        return response;
      }));
  }

  getMyPlanDetails(){
    return this.http.get<any>(`${environment.apiEndpoint}/user/getMyPlanDetails`)
      .pipe(map(response => {
        return response;
      }));
  }

  addUsersToSubscription(data: any){
    return this.http.post<any>(`${environment.apiEndpoint}/subscriptions/addUserToSubscription`, data)
      .pipe(map(response => {
        return response;
      }));
  }

  getMyTeamDetails(userId: string){
    return this.http.get<any>(`${environment.apiEndpoint}/user/getMyTeam/${userId}`)
      .pipe(map(response => {
        return response;
      }));
  }

  getMyTeamDetailsByMonth(userId: string,month: any){
    return this.http.get<any>(`${environment.apiEndpoint}/user/getMyTeam/${userId}/${month}`)
      .pipe(map(response => {
        return response;
      }));
  }

  getProgression(data: any){
    return this.http.post<any>(`${environment.apiEndpoint}/user/getProgression`, data)
      .pipe(map(response => {
        return response;
      }));
  }



  // Ajoutez ces méthodes à votre UsersService existant
getUserRankingByRole(): Observable<any> {
  return this.http.get<any>(`${environment.apiEndpoint}/user/ranking/role`)
    .pipe(map(response => {
      return response;
    }));
}

getUserRankingByPharmacy(): Observable<any> {
  return this.http.get<any>(`${environment.apiEndpoint}/user/ranking/pharmacy`)
    .pipe(map(response => {
      return response;
    }));
}

getUserRankingStats(): Observable<any> {
  return this.http.get<any>(`${environment.apiEndpoint}/user/ranking/stats`)
    .pipe(map(response => {
      return response;
    }));
}

// Ou pour tout récupérer en une seule requête:
getAllRankings(): Observable<any> {
  return this.http.get<any>(`${environment.apiEndpoint}/user/ranking/all`)
    .pipe(map(response => {
      return response;
    }));
}


}


