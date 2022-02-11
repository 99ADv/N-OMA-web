//#region Angular
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
//#endregion

//#region Others
import { environment } from 'src/environments/environment';
//#endregion

@Injectable({
  providedIn: 'root'
})

export class UserService {

  //#region Variables
  private userData$: Subject<any>;
  //#endregion

  //#region List
  access: any[] = [];
  //#endregion

  //#region Index
  constructor(
    private http: HttpClient) {
    this.userData$ = new Subject();
  }
  //#endregion

  //#region Request
  LogIn(user: any) {
    return this.http.get(environment.api_url + 'user/login', {
      params: user
    });
  }

  logout() {
    return this.http.get(environment.api_url + 'user/logout');
  }

  GetUsers() {
    return this.http.get(environment.api_url + 'user');
  }

  GetUsersAccess(params: any) {
    return this.http.get(environment.api_url + 'user/access', {
      params: params
    });
  }

  UpdateAccess(params: any) {
    return this.http.put(environment.api_url + 'user/access', params);
  }

  GetReport_summary() {
    return this.http.get(environment.api_url + 'user/incoming-resolved');
  }
  //#endregion

  //#region Get data
  GetToken() {
    let token: any = localStorage.getItem(btoa('auth'));
    if (!token) return '';
    token = JSON.parse(atob(token));
    if (!token) return '';
    return token.token;
  }

  LoggedIn(): boolean {
    let token: any = localStorage.getItem(btoa('auth'));
    
    if (!token) return false;
    token = JSON.parse(atob(token));

    if (!token) return false;
    token = token.token;

    if (token && token != null && token != undefined && token != '') return true;
    return false;
  }
  //#endregion
}