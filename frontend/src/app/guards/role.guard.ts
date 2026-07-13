import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const expectedRole = route.data['expectedRole'];

  // Check if authenticated first
  if (!authService.isAuthenticated()) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  const user = authService.currentUser();
  if (user && user.role === expectedRole) {
    return true;
  }

  // If unauthorized role, redirect to home page
  router.navigate(['/']);
  return false;
};
