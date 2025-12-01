import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Произошла ошибка';

      switch (error.status) {
        case 0:
          errorMessage = 'Сервер недоступен. Проверьте подключение.';
          break;
        case 400:
          errorMessage = error.error?.message || 'Неверный запрос';
          break;
        case 401:
          errorMessage = 'Сессия истекла. Войдите снова.';
          authService.logout();
          router.navigate(['/auth/login']);
          break;
        case 403:
          errorMessage = 'Доступ запрещён';
          break;
        case 404:
          errorMessage = 'Ресурс не найден';
          break;
        case 500:
          errorMessage = 'Внутренняя ошибка сервера';
          break;
        case 502:
        case 503:
        case 504:
          errorMessage = 'Сервер временно недоступен';
          break;
        default:
          errorMessage = error.error?.message || `Ошибка: ${error.status}`;
      }
      snackBar.open(errorMessage, '', {
        horizontalPosition: 'right',
        verticalPosition: 'top',
        duration: 1000,
      });

      return throwError(() => error);
    }),
  );
};
