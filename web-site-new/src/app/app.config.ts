import {ApplicationConfig, importProvidersFrom, LOCALE_ID, provideZoneChangeDetection} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import {BrowserAnimationsModule, provideAnimations} from "@angular/platform-browser/animations";
import {AuthService} from "./core/services/auth.service";
import {HTTP_INTERCEPTORS, provideHttpClient, withFetch, withInterceptorsFromDi} from "@angular/common/http";
import {provideToastr} from "ngx-toastr";
import {TokenInterceptor} from "./core/interceptor/token.interceptor";
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {registerLocaleData} from "@angular/common";
import localeFr from '@angular/common/locales/fr';
import {RouteInterceptorService} from "./core/interceptor/route.interceptor";

registerLocaleData(localeFr);

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: LOCALE_ID, useValue: 'fr-FR' },
    provideClientHydration(),
    provideHttpClient(withInterceptorsFromDi(), withFetch()),
    AuthService,
    RouteInterceptorService,
    provideToastr({
      timeOut: 10000,
      positionClass: 'toast-bottom-right',
      preventDuplicates: true,
    }),
    provideAnimations(),
    importProvidersFrom([BrowserAnimationsModule]),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    }, provideAnimationsAsync()
  ]
};
