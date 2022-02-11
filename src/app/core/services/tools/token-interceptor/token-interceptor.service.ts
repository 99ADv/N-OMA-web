//#region Angular
import { Injectable } from '@angular/core';
import {HttpRequest,HttpHandler,HttpEvent,HttpInterceptor} from '@angular/common/http';
import { Observable } from 'rxjs';
//#endregion

//#region Services
import { UserService } from '../../api/user/user.service';
//#endregion

@Injectable({
  providedIn: 'root'
})
export class TokenInterceptorService {

  //#region Index
  constructor(
    private userService: UserService
  ) { }
  //#endregion

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const requestl = request.clone({
      setHeaders: {
        authorization: `Bearer ${this.userService.GetToken()}`
      }
    });
    return next.handle(requestl);
  }
}
