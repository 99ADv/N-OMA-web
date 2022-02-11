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

export class TicketService {
  //#region Variables
  private url_api = environment.api_url + 'ticket/';
  //#endregion

  //#region Start
  constructor(private http: HttpClient) { }
  //#endregion

  //#region Methods
  Create(params: any) {
    return this.http.post(this.url_api, params);
  }

  CreateTicke_of_callLog(ticket: any) {
    const fd = new FormData();
    fd.append('customer', ticket.customer);
    fd.append('subject', ticket.subject);
    fd.append('body', ticket.body);
    fd.append('agent', ticket.agent);
    fd.append('password', ticket.password);
    fd.append('callLogID', ticket.callLogID);
    fd.append('type', ticket.type);

    return this.http.post(this.url_api, fd);
  }

  Get(params: any) {
    return this.http.get(this.url_api + 'web-service', {
      params: params
    });
  }

  GetQueue() {
    return this.http.get(this.url_api + 'queues');
  }
  //#endregion
}
