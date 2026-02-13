import {EventEmitter, Injectable, Output} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, map, Observable} from 'rxjs';
import {environment} from "../../../environments/environment";
import {LocalStorageService} from "./localstorage.service";
import {User} from "../models/user.model";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  @Output() isLoggedIn: EventEmitter<any> = new EventEmitter();

  public currentUserSubject!: BehaviorSubject<User>;
  public currentUser!: Observable<User>;

  constructor(private http: HttpClient, private localStorageService: LocalStorageService) {
    let localStorageUser = this.getUser()
    this.currentUserSubject = new BehaviorSubject<User>(localStorageUser);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  loginAdmin(email: string, password: string) {
    return this.http.post<any>(`${environment.apiEndpoint}/admin/login`, {email: email, password: password})
      .pipe(map(response => {
        this.isLoggedIn.emit(response);
        return response;
      }));
  }

  login(email: string, password: string) {
    return this.http.post<any>(`${environment.apiEndpoint}/auth/login`, {email: email, password: password})
      .pipe(map(response => {
        this.isLoggedIn.emit(response);
        return response;
      }));
  }

  register(data: {}) {
    return this.http.post<any>(`${environment.apiEndpoint}/auth/register`, data)
      .pipe(map(response => {
        this.isLoggedIn.emit(response);
        return response;
      }));
  }

  verifyKey(data: {}) {
    return this.http.post<any>(`${environment.apiEndpoint}/keys/verifyKey`, data);
  }

  forgetPassword(email: string) {
    return this.http.post<any>(`${environment.apiEndpoint}/user/forgot-password`, {email: email});
  }

  resetPassword(password: string, token: string) {
    return this.http.post<any>(`${environment.apiEndpoint}/user/reset-password`, {password: password, token: token});
  }

  getUser(): any {
    return this.localStorageService.getItem('user')
  }

  setUser(user: any): any {
    const newDataUser =  {
      token: this.getToken(),
      ...user
    }
    this.localStorageService.setItem('user', newDataUser);
  }

  getToken(): any {
    const user = this.getUser()
    return user ? user.token : null;
  }

  getRole(): any {
    const user = this.getUser();
    return user ? user.role : null;
  }

  isAuthenticated() {
    const token = (this.getToken());
    return !!(token);
  }

  logout() {
    this.localStorageService.clear();
  }
}
