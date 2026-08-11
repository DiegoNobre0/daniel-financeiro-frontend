import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError, BehaviorSubject, filter, take } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

let isRefreshing = false;
let refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const router = inject(Router);


  // ← Pega o token atual do signal
  const token = authService.accessToken();

  // 1. O 'withCredentials: true' é o que faz o navegador incluir o cookie automaticamente
  const authReq = req.clone({
    withCredentials: true,
    ...(token ? { setHeaders: { Authorization: `Bearer ${token}` } } : {})
  });

   return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (
        error.status === 401 &&
        !req.url.includes('auth/login') &&
        !req.url.includes('/auth/refresh')
      ) {
        if (!isRefreshing) {
          isRefreshing = true;
          refreshTokenSubject.next(null);

          return authService.refreshToken().pipe(
            switchMap(() => {
              isRefreshing = false;
              refreshTokenSubject.next(true);

              // ← Refaz a requisição COM o novo token
              const newToken = authService.accessToken();
              const retryReq = req.clone({
                withCredentials: true,
                ...(newToken ? { setHeaders: { Authorization: `Bearer ${newToken}` } } : {})
              });
              return next(retryReq);
            }),
            catchError((err) => {
              isRefreshing = false;
              authService.logout();
              router.navigate(['/login']);
              return throwError(() => err);
            })
          );
        } else {
          return refreshTokenSubject.pipe(
            filter(result => result !== null),
            take(1),
            switchMap(() => {
              const newToken = authService.accessToken();
              const retryReq = req.clone({
                withCredentials: true,
                ...(newToken ? { setHeaders: { Authorization: `Bearer ${newToken}` } } : {})
              });
              return next(retryReq);
            })
          );
        }
      }
      return throwError(() => error);
    })
  );
};