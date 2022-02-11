//#region Angular
import { Component, OnInit } from '@angular/core';
//#endregion

//#region Services
import { ChatService } from 'src/app/core/services/api/chat/chat.service';
import { HelperdevService } from 'src/app/core/services/tools/helperdev/helperdev.service';
import { ObservableService } from 'src/app/core/services/tools/observable/observable.service';
import { UserService } from 'src/app/core/services/api/user/user.service';
//#endregion

//#region Others
import { Socket } from 'ngx-socket-io';
import * as moment from 'moment';
import { Router } from '@angular/router';
//#endregion

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})

export class ChatComponent implements OnInit {

  //#region Varaibles
  indicationChat: string = '';
  indicationUser: string = '';
  userLogin: string = '';
  userID: string = '';
  listActive: string = 'mailbox';
  listActive_:string = '';

  //#region DOM
  styleList: string = 'searcher-list-hide';
  styleListUser: string = 'searcher-list-hide';
  styleContact: string = 'contact-hide';
  userType: string = 'user-customer';
  userType_: string = 'user-agent';
  mailboxAcitve: boolean = false;
  activeAcitve: boolean = false;
  agentAcitve: boolean = false;
  styleChats: boolean = false;
  //#endregion 

  //#endregion

  //#region Lists
  chats: any = {
    active: [],
    archived: []
  }
  chatMailBox: any = [];
  chatList: any = [];
  chats_closed: any = []
  chatAgents: any = [];
  users: any = [];
  usersCustomers: any = [];
  usersAgents: any = [];
  filterList = {
    mailBox: [],
    active: [],
    chats_closed: [],
    chatAgents: [],
    chatArchived: []
  };
  filterListUser = {
    customer: [],
    agent: []
  };
  //#endregion

  //#region Index
  constructor(
    private chatService: ChatService,
    private userService: UserService,
    private observable: ObservableService,
    private helperDev: HelperdevService,
    private router: Router,
    private socket: Socket) { }
  //#endregion

  //#region Live cycle
  ngOnInit(): void {
    // if(!this.helperDev.VerifyAccess(1)) {
    //   this.router.navigate(['/403']);
    //   return
    // } else {
      this.GetUserData();
      this.GetUsers();
      this.socket.fromEvent('message').subscribe(
        (result: any) => {
          if (this.userID == result.toID || result.to == '0' || result.toID == '-1') {
            this.GetChats();
            if (result.to == '0') this.mailboxAcitve = true;
          }
        }
      );
  
      this.observable.LoadHeaderStyle({ style: 1, page: 1 });
    // }
  }
  //#endregion

  //#region API
  GetChats() {
    this.activeAcitve = false;
    this.agentAcitve = false;

    this.observable.LoadNotificaction({ option: 'loading', sw: true })

    this.chatService.Get().subscribe(
      (result: any) => {
        let interpretResponse = this.helperDev.InterpretResponse(result);
        if (interpretResponse.status == false) {
          this.observable.LoadNotificaction({
            option: 'message',
            type: 'm-error',
            message: 'No se pudo cargar la lista de chats',
          })
          return;
        }
        this.observable.LoadNotificaction({ option: 'loading', sw: false })
        this.chatMailBox = result.result.mailbox;
        this.chats = result.result.chats;
        this.chats_closed = result.result.chats_closed;
        this.chatAgents = result.result.chat_agents;
        if(this.chats.archived.length == 0 && this.listActive == 'archived') {
          this.listActive = 'active';
        }
        this.RenderList();
        this.ShowList(0);
        this.chats.active.forEach((element: any) => {
          if (element.new_messages > 0) this.activeAcitve = true;
        });
        this.chatAgents.forEach((element: any) => {
          if (element.new_messages > 0) this.agentAcitve = true;
        });
      }
      ,
      error => this.observable.LoadNotificaction({
        option: 'message',
        type: 'm-error',
        message: '(404) No se pudo cargar la lista de chats',
      })
    )
  }

  GetUsers() {
    if(this.usersCustomers.length != 0 && this.usersAgents.length != 0) return;

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
      }
      , error => this.observable.LoadNotificaction({
        option: 'message',
        type: 'm-error',
        message: '(404) No se pudo cargar la lista de usuarios',
      })
    );
  }
  //#endregion

  //#region Events
  FilterLists() {
    this.filterList = {
      mailBox: this.LIKE_list(this.chatMailBox),
      active: this.LIKE_list(this.chats.active),
      chats_closed: this.LIKE_list(this.chats_closed),
      chatAgents: this.LIKE_list(this.chatAgents),
      chatArchived: this.LIKE_list(this.chats.archived)
    }
    if (this.filterList['mailBox'].length != 0
      || this.filterList['active'].length != 0
      || this.filterList['chats_closed'].length != 0
      || this.filterList['chatAgents'].length != 0) {
      this.styleList = 'searcher-list-show';
    }
    else this.styleList = 'searcher-list-hide';
  }

  FilterListsUser() {
    this.filterListUser = {
      customer: this.LIKE_listUser(this.usersCustomers),
      agent: this.LIKE_listUser(this.usersAgents)
    }
    if (this.filterListUser['customer'].length != 0
      || this.filterListUser['agent'].length != 0) {
      this.styleListUser = 'searcher-list-show';
    }
    else this.styleListUser = 'searcher-list-hide';
  }

  ShowList(from: number) {
    if(this.listActive_ == this.listActive && from != 0) return;
    this.styleChats = false;
    this.styleContact = 'contact-hide';
    this.chatList = [];
    switch (this.listActive) {
      case 'mailbox':
        this.chatList = this.chatMailBox;
        break
      case 'active':
        this.chatList = this.chats.active;
        if(this.chats.archived.length > 0)
          this.styleChats = true;
        break;
      case 'closed':
        this.chatList = this.chats_closed;
        break;
      case 'agent':
        this.chatList = this.chatAgents;
        break;
      case 'new':
        this.styleContact = 'contact-show';
        break;
      case 'archived':
        this.chatList = this.chats.archived;
        if(this.chats.archived.length > 0)
          this.styleChats = true;
        else {
          this.ShowList(1);
          this.listActive = 'active';
        }
        break;
    }
    this.listActive_ = this.listActive;
  }

  ShowListUsers() {
    if(this.userType_ == this.userType) return;
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
  //#endregion

  //#region Tools
  GetUserData() {
    let user: any = localStorage.getItem(btoa('auth'));
    if (!user) return;
    user = JSON.parse(atob(user));
    this.userLogin = user.userData.login;
    this.userID = user.userData.id;
    this.GetChats();
  }

  LIKE_list(list: any[]) {
    if (list.length == 0) return [];
    let indication: string = this.indicationChat.toLowerCase();
    if (indication == '')  return [];
    let list_aux: any = [];
    list.forEach((element: any) => {
      let subject: string = element.subject == null ? '' : element.subject;
      subject = subject.toLowerCase();

      let customerName: string = element.customerName == null ? '' : element.customerName;
      customerName = customerName.toLowerCase();
      
      if (subject.indexOf(indication) !== -1 || customerName.indexOf(indication) != -1) {
        list_aux.push(element);
      }
    });
    return list_aux;
  }

  LIKE_listUser(list: any) {
    if (list.length == 0) return [];
    let indication: string = this.indicationUser.toLowerCase();
    if (indication == '')  return [];
    let list_aux: any = [];
    list.forEach((element: any) => {
      let name: string = element.full_name == null ? '' : element.full_name;
      name = name.toLowerCase();

      if (name.indexOf(indication) !== -1) {
        list_aux.push(element);
      }
    });
    return list_aux;
  }

  RenderList() {
    for (let a = 0; a < this.chatMailBox.length; a++) {
      let date = moment(this.chatMailBox[a].change_time).format('l');
      if (date == moment().format('l')) this.chatMailBox[a].change_time = moment(this.chatMailBox[a].change_time).format('LT');
      else this.chatMailBox[a].change_time = date;
    }

    for (let a = 0; a < this.chats_closed.length; a++) {
      let date = moment(this.chats_closed[a].change_time).format('l');
      if (date == moment().format('l')) this.chats_closed[a].change_time = moment(this.chats_closed[a].change_time).format('LT');
      else this.chats_closed[a].change_time = date;
    }

    for (let a = 0; a < this.chats.active.length; a++) {
      let date = moment(this.chats.active[a].change_time).format('l');
      if (date == moment().format('l')) this.chats.active[a].change_time = moment(this.chats.active[a].change_time).format('LT');
      else this.chats.active[a].change_time = date;
    }

    for (let a = 0; a < this.chats.archived.length; a++) {
      let date = moment(this.chats.archived[a].change_time).format('l');
      if (date == moment().format('l')) this.chats.archived[a].change_time = moment(this.chats.archived[a].change_time).format('LT');
      else this.chats.archived[a].change_time = date;
    }

    for (let a = 0; a < this.chatAgents.length; a++) {
      let date = moment(this.chatAgents[a].change_time).format('l');
      if (date == moment().format('l')) this.chatAgents[a].change_time = moment(this.chatAgents[a].change_time).format('LT');
      else this.chatAgents[a].change_time = date;
    }
  }
  //#endregion
}