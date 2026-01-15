import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const permission = route.data?.['permission'] as string;
  const role = route.data?.['role'] as string;

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  if (permission && !authService.hasPermission(permission)) {
    router.navigate(['/articles']);
    return false;
  }

  if (role && !authService.hasRole(role)) {
    router.navigate(['/articles']);
    return false;
  }

  return true;
};
