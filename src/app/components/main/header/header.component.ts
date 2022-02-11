//#region Angular
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/core/services/api/user/user.service';
import { HelperdevService } from 'src/app/core/services/tools/helperdev/helperdev.service';
//#endregion

//#region Services
import { ObservableService } from 'src/app/core/services/tools/observable/observable.service';
//#endregion

//#region Others
import { Socket } from 'ngx-socket-io';
import * as moment from 'moment';
import * as Push from 'push.js';
//#endregion

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})

export class HeaderComponent implements OnInit {

  //#region Variables
  option: number = 0;
  chatN: boolean = false;
  phoneTicket: boolean = false;
  swLoad: boolean = true;

  //#region DOM
  styleHeader: string = 'header-none';
  //#endregion

  //#endregion

  //#region Object
  userData: any = {};
  //#endregion

  //#region List
  access: any [] = [];
  //#endregion

  //#region Index
  constructor(
    private router: Router,
    private observable: ObservableService,
    private userService: UserService,
    private socket: Socket,
    private helperDev: HelperdevService) { }
  //#endregion

  //#region Live cycle
  ngOnInit(): void {
    this.StyleHeader();
    this.SocketEvents();
    this.GetAccess();
  }
  //#endregion

  //#region subscriptions
  StyleHeader() {
    this.observable.GetHeaderStyle().subscribe(
      (reusult: any) => {
        if(this.swLoad) this.GetAccess();
        switch (reusult.style) {
          case 0:
            this.styleHeader = 'header-menu';
            this.swLoad = false;
            break;
          case 1:
            this.styleHeader = 'header-bar';
            this.swLoad = false;
            break;
          case 2:
            this.styleHeader = 'header-none';
            this.swLoad = true;
            break;
        }
        this.option = reusult.page;
        switch (this.option) {
          case 1:
            this.chatN = false
            break;
        }
        this.GetUserData();
      }
    );
  }
  //#endregion

  //#region API
  Logout() {
    this.observable.LoadNotificaction({ option: 'loading', sw: true })

    this.userService.logout().subscribe(
      (result: any) => {
        let interpretResponse = this.helperDev.InterpretResponse(result);
        if (interpretResponse.status == false) {
          this.observable.LoadNotificaction({
            option: 'message',
            type: 'm-error',
            message: 'No se pudo cerrar su sesión, intentelo nuevamente.',
          })
          return;
        }
        this.observable.LoadNotificaction({ option: 'loading', sw: false });
        localStorage.removeItem(btoa('auth'));
        this.router.navigate(['/login']);
      }
      ,
      error => this.observable.LoadNotificaction({
        option: 'message',
        type: 'm-error',
        message: '(404) No se pudo cerrar su sesión, intento nuevamente.',
      })
    )
  }

  GetAccess() {
    this.observable.LoadNotificaction({ option: 'loading', sw: true })

    this.userService.GetUsersAccess({ op: '2' }).subscribe(
      (result: any) => {
        let interpretResponse = this.helperDev.InterpretResponse(result);
        if (interpretResponse.status == false) {
          this.observable.LoadNotificaction({
            option: 'message',
            type: 'm-error',
            message: 'No se pudo cargar la lista de accesos',
          })
          return;
        }
        this.observable.LoadNotificaction({ option: 'loading', sw: false })
        this.access = result.results;
        this.userService.access = this.access;
      }
      , error => this.observable.LoadNotificaction({
        option: 'message',
        type: 'm-error',
        message: '(404) No se pudo cargar la lista de accesos',
      })
    );
  }
  //#endregion

  //#region Event
  SocketEvents() {
    this.socket.fromEvent('message').subscribe(
      (result: any) => {
        if (result.to == '0') {
          this.AudioPlay('../../../../assets/audio/chatHome.mp3');
          if (this.option != 1) {
            this.chatN = true;
            this.Nofication('Mensaje', 'Nuevo mensaje');
          }
        } else {
          if (this.option != 1) {
            result.to.forEach((element: any) => {
              if (element.id == this.userData.userData.id) {
                this.chatN = true;
                this.Nofication('Mensaje', 'Nuevo mensaje');
                this.AudioPlay('../../../../assets/audio/chatHome.mp3');
              }
            });
          }
        }
      }
    )

    this.socket.fromEvent('call_log').subscribe(
      (result: any) => {
        if (result == '0') {
          if (this.option != 2) {
            this.phoneTicket = true;
            this.Nofication('Llamada', 'Nueva llamada');
          }
          this.AudioPlay('../../../../assets/audio/llamada.mp3');
        }
      }
    )

    this.socket.fromEvent('notification').subscribe(
      (result: any) => {
        if ((result.permissions == '1' || result.permissions == '0')) {
          if (result.show == '1') {
            this.AudioPlay('../../../../assets/audio/timbre1.mp3');
            this.Nofication('Notificación', 'Nueva notificación');
          }
          // this.GetNotifications();
        }
      }
    )

    this.socket.fromEvent('config').subscribe(
      (result: any) => {
        if (result.to == this.userData.userData.id && result.load == 'access') {
          this.GetAccess();
        }
      }
    )
  }
  //#endregion

  //#region Tools
  GetUserData() {
    let user: any = localStorage.getItem(btoa('auth'));
    if (!user) return;
    this.userData = JSON.parse(atob(user));
  }

  Nofication(title: string, body: string) {
    Push.default.create(title, {
      body: body,
      icon: './assets/images/coordinadora.png',
      timeout: 6000,
      onClick: function () {
        window.focus();
      }
    });
  }

  AudioPlay(path: string) {
    const audio = new Audio(path)
    audio.play();
  }
  //#endregion
}