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

export class TelService {
  //#region Variables
  private url_api = environment.api_url + 'tel/';
  private url_api_call = environment.api_url + 'call-log/';
  //#endregion

  //#region Start
  constructor(private http: HttpClient) { }
  //#endregion

  //#region Methods
  Create(params: any) {
    return this.http.put(this.url_api_call + 'report-create', params);
  }

  CreateTel(params: any) {
    return this.http.post(this.url_api, params);
  }

  GetTels() {
    return this.http.get(this.url_api + 'user-asign');
  }

  Get() {
    return this.http.get(this.url_api);
  }

  Update(params: any) {
    return this.http.put(this.url_api, params);
  }

  Delete(params: any) {
    return this.http.delete(this.url_api_call, { params: params });
  }

  GetCall(params: any) {
    return this.http.get(this.url_api_call, { params: params });
  }

  UpdateCallLog(params: any) {
    return this.http.put(this.url_api_call, params);
  }

  DeleteRecord(params: any) {
    return this.http.post(this.url_api_call + 'delete', params);
  }
  //#endregion
}
