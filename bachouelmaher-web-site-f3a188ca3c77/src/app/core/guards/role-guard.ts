import { inject, Injectable } from "@angular/core"; 
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { LoadingService } from "../services/loading.service";

@Injectable({ providedIn: 'root' })
class RoleGuard {
  authService = inject(AuthService);
  router = inject(Router);
  loadingService = inject(LoadingService);
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const currentUser = this.authService.getUser();
    const currentUserRole = this.authService.getRole();
    this.loadingService.setDashboardloggedState(true);
    if (currentUser) {
      const roles = route.data["roles"];
      // Vérifiez si l'utilisateur a l'un des rôles requis
      if (roles && roles.length && !roles.includes(currentUserRole)) {
        this.router.navigate(['/admin985xilinp/auth/sign-in']);
        this.loadingService.setDashboardloggedState(false);
        return false;
      }
      this.loadingService.setDashboardloggedState(false);
      return true; // L'admin a accès
    } else {
      this.router.navigate(['/admin985xilinp/auth/sign-in']);
      this.loadingService.setDashboardloggedState(false);
      return false;
    }
  
  }
}

export const checkUserRole: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean => {
  return inject(RoleGuard).canActivate(route, state);
};

