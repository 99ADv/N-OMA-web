//#region Angular
import { Component, OnInit } from '@angular/core';
//#endregion

//#region Services
import { UserService } from 'src/app/core/services/api/user/user.service';
import { HelperdevService } from 'src/app/core/services/tools/helperdev/helperdev.service';
import { ObservableService } from 'src/app/core/services/tools/observable/observable.service';
import { NotificationService } from 'src/app/core/services/api/notification/notification.service';
//#endregion

//#region Others
import { Socket } from 'ngx-socket-io';
//#endregion

@Component({
  selector: 'app-user-nav',
  templateUrl: './user-nav.component.html',
  styleUrls: ['./user-nav.component.scss']
})

export class UserNavComponent implements OnInit {
  //#region Variables
  ns: any = 0;
  swLoad: boolean = true;
  bell: boolean = true;

  //#region DOM
  styleNotificationP: boolean = false;
  message: string = '';
  notfication: string = '';
  typeNotification: string = 'm-error';
  styleNotification: string = 'notification-hide';
  styleLoading: string = 'lds-e-hide';
  styleNav: string = 'nav-none';
  indicator: string = 'indicator-0';
  //#endregion

  //#endregion

  //#region Object
  userData: any = {
    full_name: ''
  };
  report: any = {
    "incoming": 0,
    "resolved": 0,
    "cumplen SLA": 0,
    "no cumplen SLA": 0,
  };
  //#endregion

  //#region List
  notficationList: any[] = []
  //#endregion

  //#region Index
  constructor(
    private userService: UserService,
    private helperDev: HelperdevService,
    private observable: ObservableService,
    private notificationService: NotificationService,
    private socket: Socket) { }
  //#endregion

  //#region Live cycle
  ngOnInit(): void {
    this.socket.fromEvent('notification').subscribe(
      async (result: any) => {
        if ((result.receivers == '2' || result.receivers == '3')) {
          if(result.show == '1') this.helperDev.AudioPlay('../../../../assets/audio/notification.mp3')
          this.GetNotification();
        }
      }
    )

    this.Notification();
    this.StyleNav();
    this.GetReport();
    this.GetNotification()
  }
  //#endregion

  //#region API
  GetReport() {
    this.userService.GetReport_summary().subscribe(
      (result: any) => {
        let interpretResponse = this.helperDev.InterpretResponse(result);
        if (!interpretResponse.status) {
          this.message = interpretResponse.message;
          return;
        }
        this.report.incoming = result.result.incoming;
        this.report.resolved = result.result.resolved;
        this.ns = 0;
        this.indicator = 'indicator-0';
        if (this.report.incoming != 0) this.ns = ((this.report.resolved / this.report.incoming)*100).toFixed(2);
        
        if (this.ns == 50)
          this.indicator = 'indicator-50';
        else {
          if (this.ns > 0 && this.ns < 50)
            this.indicator = 'indicator-25';
          else {
            if (this.ns > 50 && this.ns < 100)
              this.indicator = 'indicator-75';
            else {
              if (this.ns >= 100)
                this.indicator = 'indicator-100';
              else this.indicator = 'indicator-0';
            }
          };
        }
      },
      error => this.message = '(404) Error inesperado'
    )
  }

  GetNotification() {
    this.observable.LoadNotificaction({ option: 'loading', sw: true })

    this.bell = false;
    this.notificationService.GetAgent().subscribe(
      (result: any) => {
        let interpretResponse = this.helperDev.InterpretResponse(result);
        if (interpretResponse.status == false) {
          this.observable.LoadNotificaction({
            option: 'message',
            type: 'm-error',
            message: 'No se pudo cargar la lista de notificaciones',
          })
          return;
        }
        this.observable.LoadNotificaction({ option: 'loading', sw: false })
        
        this.notficationList = result.notifications;
        if(this.notficationList.length > 0 ) this.bell = true;
      }
      , error => this.observable.LoadNotificaction({
        option: 'message',
        type: 'm-error',
        message: '(404) No se pudo cargar la lista de notificaciones',
      })
    );
  }
  //#endregion

  //#region subscriptions
  Notification() {
    this.observable.GetNotificaction().subscribe(
      (result: any) => {
        if (result.option == 'loading') {
          if (result.sw) this.styleLoading = 'lds-e-show';
          else this.styleLoading = 'lds-e-hide';
        } else {
          this.styleLoading = 'lds-e-hide';
          this.styleNotification = 'notification-show';
          this.typeNotification = result.type;
          this.notfication = result.message;
          setTimeout(() => {
            this.styleNotification = 'notification-hide';
            this.typeNotification = 'm-error';
            this.notfication = '';
          }, 5000);
        }
      }
    );
  }

  StyleNav() {
    this.observable.GetHeaderStyle().subscribe(
      (reusult: any) => {
        if(this.swLoad) this.GetReport();
        switch (reusult.style) {
          case 0:
            this.styleNav = 'nav-menu';
            this.swLoad = false;
            this.GetUserData();
            break;
          case 1:
            this.styleNav = 'nav-bar';
            this.swLoad = false;
            this.GetUserData();
            break;
          case 2:
            this.styleNav = 'nav-none';
            this.swLoad = true;
            break;
        }
      }
    );
  }
  //#endregion

  //#region DOM
  //#endregion

  //#region Tools
  GetUserData() {
    this.userData = localStorage.getItem(btoa('auth'));
    if (!this.userData) return;
    this.userData = JSON.parse(atob(this.userData))['userData'];
  }
  //#endregion
}