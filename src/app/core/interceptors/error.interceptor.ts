import { HttpErrorResponse } from '@angular/common/http';
import { HttpInterceptorFn } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse) {
        // central logging for server errors
        if (err.status >= 500) {
          console.error('Server error:', err.message, err);
        }
        // allow other interceptors or components to handle the error
      }
      return throwError(() => err);
    })
  );
};
