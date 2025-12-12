import {Component, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router, RouterOutlet} from '@angular/router';
import {CommonModule, isPlatformBrowser, NgClass} from "@angular/common";
import {ResponsiveHelperComponent} from "./shared/components/responsive-helper/responsive-helper.component";
import {BehaviorSubject, filter} from "rxjs";
import {SeoService} from "./core/services/seo.service";
import { LoadingService } from './core/services/loading.service';
import { LoaderComponent } from './shared/components/loader/loader.component';
import { MainLoaderComponent } from "./modules/main/components/loader/loader.component";


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ResponsiveHelperComponent, NgClass, CommonModule, LoaderComponent, MainLoaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit{
  title = 'ssr';
  isLogged = true
  isDashboardLogged = true
  static isBrowser = new BehaviorSubject<boolean>(true);

  constructor(@Inject(PLATFORM_ID) private platformId: any,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private loadingService: LoadingService,
              private seoService: SeoService) {
    AppComponent.isBrowser.next(isPlatformBrowser(platformId));
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((event) => {
        // get the route, right from the root child
        // this allows a title to be set at any level
        // but for this to work, the routing module should be set with paramsInheritanceStrategy=always
        let route = this.activatedRoute.snapshot;
        while (route.firstChild) {
          route = route.firstChild;
        }
        // if(!router.url.includes('dashboard')) this.seoService.setSeoData(route.routeConfig?.path);
      });
  }
  ngOnInit(): void {
    this.loadingService.isLogged$.subscribe(isLogged => {
      this.isLogged = isLogged;
    });

    this.loadingService.isDasboardLogged$.subscribe(isDashboardLogged => {
      this.isDashboardLogged = isDashboardLogged;
    });
  }
}
