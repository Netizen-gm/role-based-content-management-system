import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Read access token from localStorage
  const accessToken = localStorage.getItem('accessToken');
  
  // Add authorization header if token exists and it's not auth endpoints
  if (accessToken && !req.url.includes('/auth/login') && !req.url.includes('/auth/register')) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`
      }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // If 401 and not already on auth endpoints, clear tokens
      if (error.status === 401 && !req.url.includes('/auth/')) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        // Redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
      
      return throwError(() => error);
    })
  );
};
