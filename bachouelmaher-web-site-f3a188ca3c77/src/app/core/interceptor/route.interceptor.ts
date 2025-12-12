import {Injectable} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {filter} from 'rxjs/operators';

@Injectable()
export class RouteInterceptorService {
  private _previousUrl!: string;
  private _currentUrl!: string;
  private readonly _routeHistory: string[];

  constructor(router: Router) {
    this._routeHistory = [];
    router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(event => {
        this._setURLs(event as NavigationEnd);
      });
  }

  private _setURLs(event: NavigationEnd): void {
    this._previousUrl = this._currentUrl;
    this._currentUrl = event.urlAfterRedirects;
    this._routeHistory.push(event.urlAfterRedirects);
  }

  get previousUrl(): string {
    return this._previousUrl;
  }

  get currentUrl(): string {
    return this._currentUrl;
  }

  get routeHistory(): string[] {
    return this._routeHistory;
  }
}
