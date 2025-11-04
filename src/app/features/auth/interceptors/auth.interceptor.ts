import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService } from '../service/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token;
  if (token) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(req).pipe(
    catchError((err: unknown) => {
      // If unauthorized, assume token expired or invalid — force logout
      if (err instanceof HttpErrorResponse) {
        if (err.status === 401) {
          try {
            auth.logout();
          } catch (e) {
            // swallow any logout errors
            console.error('Error during auto-logout', e);
          }
        }
      }
      return throwError(() => err);
    })
  );
};
