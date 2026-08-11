import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
// import { inject } from '@angular/core';
// import { MatSnackBar } from '@angular/material/snack-bar';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  // const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // O erro 401 já é tratado pelo auth.interceptor, então ignoramos aqui
      if (error.status !== 401) {
        
        let errorMessage = 'Ocorreu um erro inesperado. Tente novamente.';

        // Captura a mensagem tratada da nossa API Fastify (classe AppError)
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        }

        // Exemplo de como usar com o Angular Material (descomente as importações)
        // snackBar.open(errorMessage, 'Fechar', { duration: 4000, panelClass: 'error-snackbar' });
        
        console.error('API Error:', errorMessage);
      }

      return throwError(() => error);
    })
  );
};