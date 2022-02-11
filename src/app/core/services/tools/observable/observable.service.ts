//#region Angular
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
//#endregion

@Injectable({
  providedIn: 'root'
})

export class ObservableService {

  //#region Variables
  private header$: Subject<any>;
  private notification$: Subject<any>;
  // private message$: Subject<any>;
  // private chatID$: Subject<string>;
  //#endregion

  //#region Index
  constructor() { 
    this.header$ = new Subject();
    this.notification$ = new Subject();
    // this.message$ = new Subject();
    // this.chatID$ = new Subject();
  }
  //#endregion

  //#region Header
  LoadHeaderStyle(sw: any) {
    this.header$.next(sw);
  }

  GetHeaderStyle() {
    return this.header$.asObservable();
  }
  //#endregion

  //#region Notification
  LoadNotificaction(sw: any) {
    this.notification$.next(sw);
  }

  GetNotificaction() {
    return this.notification$.asObservable();
  }
  //#endregion

  //#region Chat
  // LoadChats(sw: any) {
  //   this.message$.next(sw);
  // }

  // GetChats() {
  //   return this.message$.asObservable();
  // }

  // LoadChatID(sw: string) {
  //   this.chatID$.next(sw);
  // }

  // GetChatID() {
  //   return this.chatID$.asObservable();
  // }
  //#endregion
}