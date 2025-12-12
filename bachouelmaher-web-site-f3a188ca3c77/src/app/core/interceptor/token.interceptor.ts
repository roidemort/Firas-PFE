import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse
} from '@angular/common/http';

import {catchError, Observable, tap, throwError} from 'rxjs';
import {AuthService} from "../services/auth.service";
import {Router} from "@angular/router";

/** Pass untouched request through to the next request handler. */
@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(private router: Router, private auth: AuthService) {}
  intercept(req: HttpRequest<any>, next: HttpHandler):
    Observable<HttpEvent<any>> {
    const token = this.auth.getToken();
    if (token) {
      req = req.clone({
        setHeaders: {
          'X-Requested-With': 'XMLHttpRequest',
          'Authorization': this.auth.getToken()
        }

      });
    } else {
      req = req.clone({
        setHeaders: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
    }

    return next.handle(req).pipe(
      catchError((error: any) => {
        const currentUserRole = this.auth.getRole()
        if (error instanceof HttpErrorResponse && error.status === 401 && error.error.errorType === 'Unauthorized') {
          this.auth.logout();
          if(currentUserRole == "SUPER_ADMIN") this.router.navigateByUrl('/admin985xilinp/auth/sign-in');
          else this.router.navigateByUrl('/connexion');
        }
        if (error instanceof HttpErrorResponse && error.status === 405 && error.error.errorType === 'Blocking') {
          this.auth.logout();
          if(currentUserRole == "SUPER_ADMIN") this.router.navigateByUrl('/admin985xilinp/auth/sign-in');
          else this.router.navigateByUrl('/connexion');
        }
        return throwError(() => error);
      })
    );

  }
}
