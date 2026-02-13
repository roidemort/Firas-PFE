import { Injectable } from '@angular/core';
import {BehaviorSubject, map, Observable} from 'rxjs';
import {HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "../../../environments/environment";


@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private _openChat = new BehaviorSubject<boolean>(false);
  private _chatData = new BehaviorSubject<any>({});
  openChat$: Observable<boolean>;
  chatData$: Observable<{
    loading: false,
    userId: null,
    courseId: null
  }>;

  constructor(private http: HttpClient) {
    this.openChat$ = this._openChat.asObservable();
    this.chatData$ = this._chatData.asObservable();
  }

  toggleChat(open: boolean) {
    this._openChat.next(open);
  }

  loadChatData(userId?: string, courseId?: string) {
    this._chatData.next({ loading: true, userId: userId, courseId: courseId });
  }

}
