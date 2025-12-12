import { inject, Injectable } from "@angular/core"; 
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { LoadingService } from "../services/loading.service";

@Injectable({ providedIn: 'root' })
class AuthGuard {
  authService = inject(AuthService);
  router = inject(Router);
  loadingService = inject(LoadingService);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const currentUserRole = this.authService.getRole();
    const requestedRoute = state.url;
    this.loadingService.setloggedState(true);
    if (this.authService.isAuthenticated()) {
      // Vérifiez si le rôle est SUPER_ADMIN
      if (currentUserRole === 'SUPER_ADMIN') {
        this.router.navigate(['/admin985xilinp/dashboard']); // Redirection vers le tableau de board
        this.loadingService.setloggedState(false);
        return false;
      }

      const roles = route.data["roles"];
      // Vérifiez si l'utilisateur a l'un des rôles requis
      if (roles && roles.length && !roles.includes(currentUserRole)) {
        this.router.navigate(['/connexion']);
        this.loadingService.setloggedState(false);
        return false;
      }
      this.loadingService.setloggedState(false);
      return true; // L'utilisateur a accès
    } else {
      return false; // L'utilisateur n'a pas accès
    }   

    }
  }

export const checkAuthGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean => {
  return inject(AuthGuard).canActivate(route, state);
};

