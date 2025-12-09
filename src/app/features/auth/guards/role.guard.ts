import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../service/auth.service';

/**
 * Returns a CanActivateFn that allows activation only when the current user has at least
 * one of the provided roles.
 * Usage: canActivate: [canActivateRole(['Admin','Direccion'])]
 */
export const canActivateRole = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const user = auth.currentUser();
    if (!user) {
      router.navigate(['/login']);
      return false;
    }

    const roles = user.roles || [];
    const ok = allowedRoles.some((r) => roles.includes(r));
    if (!ok) {
      // optionally redirect to unauthorized page or home
      router.navigate(['/home']);
      return false;
    }
    return true;
  };
};
