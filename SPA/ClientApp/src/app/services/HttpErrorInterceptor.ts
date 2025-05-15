import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotificationService } from './NotificationService';
import { AuthService } from './AuthService';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService, private notificationService: NotificationService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request)
      .pipe(catchError((err: HttpErrorResponse) => {
        if(err.status === 401){
          this.authService.logout();
        }

        if (err.error instanceof Error) {
          console.error(err.error.message);
        } else {
          console.error(err);
        }

        this.notificationService.error("Отправка запроса завершилась ошибкой");

        return EMPTY;
      }));
  }
}