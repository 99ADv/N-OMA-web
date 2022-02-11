//#region Angular
import { Component, OnInit } from '@angular/core';
//#endregion

//#region Services
import { HelperdevService } from 'src/app/core/services/tools/helperdev/helperdev.service';
import { ObservableService } from 'src/app/core/services/tools/observable/observable.service';
import { UserService } from 'src/app/core/services/api/user/user.service';
import { NotificationService } from 'src/app/core/services/api/notification/notification.service';
//#endregion

//#region Others
import { Socket } from 'ngx-socket-io';
import * as moment from 'moment';
import { FormControl, FormGroup, Validators } from '@angular/forms';
//#endregion

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})

export class NotificationComponent implements OnInit {

  //#region Variables
  deleteItem: any = '';
  create: boolean = true;
  typeModal: string = '';
  typeModalUsers: string = '';

  //#region DOM
  styleSection: string = 'show-all';
  userType: string = 'user-customer';
  userType_: string = 'user-agent';
  //#endregion

  //#endregion

  //#region Object
  item_: any = {};
  notificationForm = new FormGroup({
    title: new FormControl('', [Validators.required]),
    message: new FormControl('', [Validators.required]),
    state: new FormControl('0', [Validators.required]),
    receiversID: new FormControl('2', [Validators.required]),
    expiration_time: new FormControl('0', [Validators.required]),
  });
  //#endregion

  //#region List
  notifications: any[] = [];
  receivers: any = {
    agents: [],
    customers: [],
  };
  usersCustomers: any = [];
  usersAgents: any = [];
  users: any = [];
  //#endregion

  //#region Index
  constructor(
    private observable: ObservableService,
    private helperDev: HelperdevService,
    private socket: Socket,
    private userService: UserService,
    private notificationService: NotificationService) { }
  //#endregion

  //#region Live cycle
  ngOnInit(): void {
    this.observable.LoadHeaderStyle({ style: 0, page: 3 });

    this.GetUsers();
    this.Get();
  }
  //#endregion

  //#region API
  Create() {
    this.observable.LoadNotificaction({ option: 'loading', sw: true })
    let data = {
      title: this.notificationForm.get('title')?.value,
      message: this.notificationForm.get('message')?.value,
      state: this.notificationForm.get('state')?.value,
      receiversID: this.notificationForm.get('receiversID')?.value,
      expiration_time: this.notificationForm.get('expiration_time')?.value,
      receivers: this.receivers,
    }

    this.notificationService.Create(data).subscribe(
      (result: any) => {
        let interpretResponse = this.helperDev.InterpretResponse(result);
        if (interpretResponse.status == false) {
          this.observable.LoadNotificaction({
            option: 'message',
            type: 'm-error',
            message: 'No se pudo guardar la notificación',
          })
          return;
        }
        this.observable.LoadNotificaction({ option: 'loading', sw: false });
        this.Get();
        this.ClearForm();
        this.typeModal = '';
      }
      , error => this.observable.LoadNotificaction({
        option: 'message',
        type: 'm-error',
        message: '(404) No se pudo guardar la notificación',
      })
    );
  }

  Get() {
    this.observable.LoadNotificaction({ option: 'loading', sw: true })
    this.notificationService.Get().subscribe(
      (result: any) => {
        let interpretResponse = this.helperDev.InterpretResponse(result);
        if (interpretResponse.status == false) {
          this.observable.LoadNotificaction({
            option: 'message',
            type: 'm-error',
            message: 'No se pudo obtener la lista de notificaciones',
          })
          return;
        }
        this.observable.LoadNotificaction({ option: 'loading', sw: false })
        this.notifications = result.notifications;
      },
      error => this.observable.LoadNotificaction({
        option: 'message',
        type: 'm-error',
        message: '(404) No se pudo obtener la lista de notificaciones',
      })
    )
  }

  GetItem(item: any) {
    this.item_ = item;
    this.receivers = this.item_.receivers;
    this.notificationForm.get('title')?.setValue(this.item_.title);
    this.notificationForm.get('message')?.setValue(this.item_.message);
    this.notificationForm.get('state')?.setValue(this.item_.state.toString());
    this.notificationForm.get('receiversID')?.setValue(this.item_.receiversID.toString());
    this.create = false;
    this.typeModal = 'form';
    this.AssignUser()
  }

  GetUsers() {
    this.observable.LoadNotificaction({ option: 'loading', sw: true })

    this.userService.GetUsers().subscribe(
      (result: any) => {
        let interpretResponse = this.helperDev.InterpretResponse(result);
        if (interpretResponse.status == false) {
          this.observable.LoadNotificaction({
            option: 'message',
            type: 'm-error',
            message: 'No se pudo cargar la lista de usuarios',
          })
          return;
        }
        this.observable.LoadNotificaction({ option: 'loading', sw: false })
        this.usersCustomers = result.result.customers;
        this.usersAgents = result.result.agents;
        this.ShowListUsers();
        this.AssignUser();
      }
      , error => this.observable.LoadNotificaction({
        option: 'message',
        type: 'm-error',
        message: '(404) No se pudo cargar la lista de usuarios',
      })
    );
  }

  Update(id: string, op: string, value: string) {
    this.observable.LoadNotificaction({ option: 'loading', sw: true })

    this.notificationService.Update({ id, op, value }).subscribe(
      (result: any) => {
        let interpretResponse = this.helperDev.InterpretResponse(result);
        if (interpretResponse.status == false) {
          this.observable.LoadNotificaction({
            option: 'message',
            type: 'm-error',
            message: 'No se pudo actualizar la notificación',
          })
          return;
        }
        switch (op) {
          case '0':
            this.item_.receiversID = this.notificationForm.get('receiversID')?.value;
            break;
          case '1':
            this.item_.title = this.notificationForm.get('title')?.value;
            break;
          case '2':
            this.item_.message = this.notificationForm.get('message')?.value;
            break;
          case '3':
            this.item_.state = this.notificationForm.get('state')?.value;
            break;
          case '5':
            this.item_.state = this.notificationForm.get('expiration_time')?.value;
            break;
        }
        this.observable.LoadNotificaction({ option: 'loading', sw: false })
        this.Get();
        if(op == '6') this.typeModal = '';
      },
      error => this.observable.LoadNotificaction({
        option: 'message',
        type: 'm-error',
        message: '(404) No se pudo actualizar la notificación',
      })
    )
  }
  //#endregion

  //#region Event
  ShowListUsers() {
    if (this.userType_ == this.userType) return;
    this.users = [];
    switch (this.userType) {
      case 'user-agent':
        this.users = this.usersAgents;
        break
      case 'user-customer':
        this.users = this.usersCustomers;
        break;
    }
    this.userType_ = this.userType;
  }

  EdictClick() {
    if (this.notificationForm.get('receiversID')?.value != this.item_.receiversID)
      this.Update(this.item_.id, '0', this.notificationForm.get('receiversID')?.value);

    if (this.notificationForm.get('title')?.value != this.item_.title)
      this.Update(this.item_.id, '1', this.notificationForm.get('title')?.value);

    if (this.notificationForm.get('message')?.value != this.item_.message)
      this.Update(this.item_.id, '2', this.notificationForm.get('message')?.value);

    if (this.notificationForm.get('state')?.value != this.item_.message)
      this.Update(this.item_.id, '3', this.notificationForm.get('state')?.value);

    if (this.notificationForm.get('expiration_time')?.value != this.item_.message)
      this.Update(this.item_.id, '5', this.notificationForm.get('expiration_time')?.value);
  }
  //#endregion

  //#region DOM
  //#endregion

  //#region Tools
  ClearForm() {
    this.item_ = {};
    this.notificationForm.get('title')?.setValue('');
    this.notificationForm.get('message')?.setValue('');
    this.notificationForm.get('state')?.setValue('0');
    this.notificationForm.get('receiversID')?.setValue('2');
    this.notificationForm.get('expiration_time')?.setValue('0');
    this.receivers = {
      agents: [],
      customers: [],
    };
  }

  AddList(item: any, list: any[], list_push: number, event: boolean) {
    if (event) {
      list.forEach((element) => {
        if (element.id == item.id) {
          this.typeModalUsers = '';
          return;
        }
      });
      if (list_push == 1) this.receivers['agents'].push(item);
      else this.receivers['customers'].push(item);
      item.active = true;
    } else {
      let list_aux: any[] = [];
      list.forEach((element: any) => {
        if (element.id != item.id) {
          list_aux.push(element)
        }
      });
      if (list_push == 1) this.receivers['agents'] = list_aux;
      else this.receivers['customers'] = list_aux;
      item.active = false;
    }
  }

  AssignUser() {
    this.receivers['agents'].forEach((element: any) => {
      this.usersAgents.forEach((element1: any) => {
        if (element1.id == element.id) element1.active = true;
      });
    });
    this.receivers['customers'].forEach((element: any) => {
      let sw = false;
      this.usersCustomers.forEach((element1: any) => {
        if (element1.id == element.id) element1.active = true;
      });
    });
  }
  //#endregion
}