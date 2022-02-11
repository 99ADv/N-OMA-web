//#region Angular
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
//#endregion

//#region Others
import { environment } from 'src/environments/environment';
//#endregion

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  //#region Variables
  private url_api = environment.api_url + 'notification/';
  //#endregion

  //#region Start
  constructor(private http: HttpClient) { }
  //#endregion

  //#region Methods
  Create(params: any) {
    return this.http.post(this.url_api, params);
  }

  Get() {
    return this.http.get(this.url_api);
  }

  GetAgent() {
    return this.http.get(this.url_api+'agent');
  }

  GetItem(params: any) {
    return this.http.get(this.url_api, { params: params });
  }

  Update(params: any) {
    return this.http.put(this.url_api, params);
  }

  Delete(params: any) {
    return this.http.delete(this.url_api, { params: params });
  }
  //#endregion
}