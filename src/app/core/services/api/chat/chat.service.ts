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

export class ChatService {

  //#region Variables
  private url_api = environment.api_url + 'chat/';
  //#endregion

  //#region Index
  constructor(private http: HttpClient) { }
  //#endregion

  //#region Request
  Create(chat: any, message: any, file: File | null) {
    const fd = new FormData();
    fd.append('subject', chat.subject);
    fd.append('to', chat.to);
    fd.append('body', message.body);
    if (chat.chatType) fd.append('chatType', chat.chatType);
    if (file) fd.append('file', file);

    return this.http.post(this.url_api, fd);
  }

  CreateMessage(message: any, file: File | null) {
    const fd = new FormData();
    fd.append('chatID', message.chatID);
    fd.append('to', message.to);
    fd.append('body', message.body);
    if (file) fd.append('file', file);
    return this.http.post(this.url_api + 'message', fd);
  }

  Update(params: any) {
    return this.http.put(this.url_api, params);
  }

  AddParticipant(params: any) {
    return this.http.post(this.url_api +'add-participant', params);
  }

  Reasign(params: any) {
    return this.http.post(this.url_api +'re-asign', params);
  }

  PinChat(params: any) {
    return this.http.post(this.url_api +'message/pin', params);
  }

  PinChatUpdate(params: any) {
    return this.http.delete(this.url_api +'message/pin', { params: params });
  }

  GetPinChat(params: any) {
    return this.http.get(this.url_api +'message/pin', { params: params });
  }

  UpdateMessage(params: any) {
    return this.http.put(this.url_api + 'view', params);
  }

  VerifyChat(params: any) {
    return this.http.get(this.url_api + 'verify', { params: params });
  }

  Get() {
    return this.http.get(this.url_api);
  }

  GetData(params: any) {
    return this.http.get(this.url_api + 'data', { params: params });
  }

  GetMessage(params: any) {
    return this.http.get(this.url_api + 'message', { params: params });
  }

  UpdateAgent(params: any) {
    return this.http.put(this.url_api + 're_asign', { params: params });
  }
  //#endregion
}
