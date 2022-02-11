//#region Angular
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { environment } from 'src/environments/environment';
//#endregion

//#region Service
import { ChatService } from 'src/app/core/services/api/chat/chat.service';
import { HelperdevService } from 'src/app/core/services/tools/helperdev/helperdev.service';
import { ObservableService } from 'src/app/core/services/tools/observable/observable.service';
//#endregion

//#region Others
import { Socket } from 'ngx-socket-io';
import * as moment from 'moment';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TicketService } from 'src/app/core/services/api/ticket.service';
interface HTMLInputEvent extends Event {
  target: HTMLInputElement & EventTarget;
}
//#endregion

@Component({
  selector: 'app-chat-message',
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.scss']
})

export class ChatMessageComponent implements OnInit {
  //#region Variable
  @ViewChild('iputFile') iputFile: ElementRef | any;
  @ViewChild('messages') messages: ElementRef | any;
  @Input() userLogin: string = '';
  @Input() userID: string = '';
  @Input() listActive: string = '';
  attached: File | null = null;
  newMessages: number = 0;
  typeFile: any = '';
  fileName: any = '';
  indicationUser: string = '';
  indicationMessage: string = '';
  indicationPin: string = '';
  userActive = 'cliente';
  now: string = '';
  sectionShow = 'Historial';
  contentModal = 'Asunto del chat';
  pintTitle: string = '';
  event: boolean = false;
  url_api: string = '';
  scroll: any = '';

  //#region Event
  @Output() loadChats = new EventEmitter<boolean>();
  //#endregion

  //#region DOM
  styleGroup: string = 'group-hide';
  styleGroupAdd: string = 'group-add-hide';
  styleModal: string = 'modal-hide';
  styleSection: boolean = false;
  styleTime: boolean = false;
  styleData: boolean = false;
  styleAttached: boolean = false;
  styleBlockMessageForm: boolean = false;
  styleBTNScroll: boolean = false;
  typeModal: number = 0;
  //#endregion

  //#endregion

  //#region List
  filterList: any[] = [];
  usrList: any[] = [];
  @Input() usersCustomer: any[] = [];
  @Input() usersAgents: any[] = [];
  userGroup: any[] = [];
  filterMessage: any[] = [];
  filterPin: any[] = [];
  //#endregion

  //#region Object
  chatForm = new FormGroup({
    subject: new FormControl('', [Validators.required]),
    to: new FormControl('', [Validators.required]),
    chatType: new FormControl('', [Validators.required])
  });
  messageForm = new FormGroup({
    chatID: new FormControl('-1', [Validators.required]),
    body: new FormControl('', [Validators.required]),
    to: new FormControl('', [Validators.required])
  });
  reasignForm = new FormGroup({
    chatID: new FormControl('', [Validators.required]),
    ownerID: new FormControl('', [Validators.required]),
    new_ownerID: new FormControl('', [Validators.required]),
    reason: new FormControl('', [Validators.required])
  });
  chat: any = {
    data: {
      id: 0,
      owner: '',
      ownerID: '',
      agent: null,
      agentID: 1,
      subject: '',
      state: 0,
      chat_type: 0,
      create_time: '',
      change_time: '',
      ticketID: null,
      closed_time: '',
      archived: 0,
      delete: 0
    },
    messages: [],
    pinned: [],
    participants: [],
    scaled: []
  }
  //#endregion

  //#region Index
  constructor(
    private chatService: ChatService,
    private helperDev: HelperdevService,
    private observable: ObservableService,
    private ticketService: TicketService,
    private socket: Socket
  ) { }
  //#endregion

  //#region Live cycle
  ngOnInit(): void {
    this.url_api = environment.api_url;
    setInterval(() => {
      this.now = moment().format();
    }, 1000)

    this.socket.fromEvent('message').subscribe(
      (result: any) => {
        if (result.chatID == this.chat.data.id) {
          result.to.forEach((element: any) => {
            if (this.userID == element.id) {
              if (result.load == 'chat') {
                
                this.GetChat({ id: this.chat.data.id, owner: this.chat.data.ownerID })
              }
              else if (result.load == 'message') {
                this.GetMessages();
                this.UpdateMessage();
              }
              return;
            }
          });
          this.helperDev.AudioPlay('../../../../assets/audio/newMessage.mp3');
        }
      }
    );
    let messageScroll: any = document.getElementById("messages-div");
    messageScroll?.addEventListener("scroll", ()=> {
      if(messageScroll?.scrollTop != this.scroll) {
        this.styleBTNScroll = true;
      } else {
        this.styleBTNScroll = false;
      }
  });
  }
  //#endregion

  //#region API

  //#region Chat
  CreateChat() {
    this.styleBlockMessageForm = true;
    this.observable.LoadNotificaction({ option: 'loading', sw: true })

    this.chatService.Create(this.chatForm.value, this.messageForm.value, this.attached).subscribe(
      (result: any) => {
        this.styleBlockMessageForm = false;
        let interpretResponse = this.helperDev.InterpretResponse(result);
        if (interpretResponse.status == false) {
          this.observable.LoadNotificaction({
            option: 'message',
            type: 'm-error',
            message: 'No se pudo crear el chat.'
          })
          return;
        }
        this.loadChats.emit(true);
        this.observable.LoadNotificaction({ option: 'loading', sw: false })
        this.event = false;
        this.messageForm.get('body')?.setValue('');
        if (this.attached) this.ClearFile();
        this.GetChat({ id: result.chatID });
      },
      error => {
        this.observable.LoadNotificaction({
          option: 'message',
          type: 'm-error',
          message: '(404) No se pudo crear el chat.'
        })
        this.styleBlockMessageForm = false;
      }
    )
  }

  GetChat(chat: any) {
    this.observable.LoadNotificaction({ option: 'loading', sw: true })
    let data = {};
    if (this.listActive == 'mailbox') data = { chatID: chat['id'], owner: chat['owner'] }
    else data = { chatID: chat['id'] }

    this.chatService.GetData(data).subscribe(
      (result: any) => {
        let interpretResponse = this.helperDev.InterpretResponse(result);
        if (interpretResponse.status == false) {
          this.observable.LoadNotificaction({
            option: 'message',
            type: 'm-error',
            message: 'No se pudo obtener los datos del chat ' + chat.id
          })
          return;
        }
        this.loadChats.emit(true);
        this.styleModal = 'modal-hide';
        this.styleSection = false;
        this.event = false;
        this.chat = result.result;
        this.filterPin = this.chat.pinned;
        this.newMessages = chat.new_messages ? chat.new_messages : 0;
        // this.UpdateMessage();
        this.reasignForm.get('ownerID')?.setValue(this.userID);
        this.reasignForm.get('chatID')?.setValue(this.chat.data.id);
        this.messageForm.get('from')?.setValue(this.userID);
        this.messageForm.get('chatID')?.setValue(this.chat.data.id);
        this.messageForm.get('to')?.setValue(JSON.stringify(this.chat.participants));
        this.RenderList();
        this.observable.LoadNotificaction({ option: 'loading', sw: false })
        setTimeout(() => {
          this.ScrollTop();
        }, 500);
      },
      error => this.observable.LoadNotificaction({
        option: 'message',
        type: 'm-error',
        message: '(404) No se pudo obtener los datos del chat ' + chat.id
      })
    )
  }

  SendMessage() {
    this.styleBlockMessageForm = true;
    this.observable.LoadNotificaction({ option: 'loading', sw: true })

    this.chatService.CreateMessage(this.messageForm.value, this.attached).subscribe(
      (result: any) => {
        this.styleBlockMessageForm = false;
        let interpretResponse = this.helperDev.InterpretResponse(result);
        if (interpretResponse.status == false) {
          this.observable.LoadNotificaction({
            option: 'message',
            type: 'm-error',
            message: 'No se pudo enviar el mensaje.'
          })
          return;
        }
        this.loadChats.emit(true);
        this.messageForm.get('body')?.setValue('');
        if (this.attached) this.ClearFile();
        this.GetMessages();
        this.observable.LoadNotificaction({ option: 'loading', sw: false })
      }
      ,
      error => {
        this.observable.LoadNotificaction({
          option: 'message',
          type: 'm-error',
          message: '(404) No se pudo enviar el mensaje.'
        })
        this.styleBlockMessageForm = false;
      }
    )
  }

  GetMessages() {
    this.observable.LoadNotificaction({ option: 'loading', sw: true })

    this.chatService.GetMessage({ chatID: this.chat.data.id }).subscribe(
      (result: any) => {
        let interpretResponse = this.helperDev.InterpretResponse(result);
        if (interpretResponse.status == false) {
          this.observable.LoadNotificaction({
            option: 'message',
            type: 'm-error',
            message: 'No se pudo obtener los mensajes del chat.'
          })
          return;
        }
        this.chat.messages = result.messages;
        this.RenderList();
        this.observable.LoadNotificaction({ option: 'loading', sw: false })
        setTimeout(() => {
          this.ScrollTop();
        }, 500);
      },
      error => this.observable.LoadNotificaction({
        option: 'message',
        type: 'm-error',
        message: '(404) No se pudo obtener los mensajes del chat.'
      })
    )
  }

  UpdateChat(op: string, newValue: string) {
    this.chatService.Update({ chatID: this.chat.data.id, op, newValue }).subscribe(
      (result: any) => {
        let interpretResponse = this.helperDev.InterpretResponse(result);
        if (interpretResponse.status == false) {
          this.observable.LoadNotificaction({
            option: 'message',
            type: 'm-error',
            message: 'No se pudo actualizar el chat ' + this.chat.data.id
          })
          return;
        }
        this.loadChats.emit(true);
        if (op == '1') this.ClearChat();
        else this.GetChat(this.chat.data);
      },
      error => this.observable.LoadNotificaction({
        option: 'message',
        type: 'm-error',
        message: '(404) No se pudo actualizar el chat ' + this.chat.data.id
      })
    )
  }

  UpdateMessage() {
    if (this.newMessages == 0) return;
    this.chatService.UpdateMessage({ chatID: this.chat.data.id, fromPage: '0', userLogin: this.userLogin }).subscribe(
      (result: any) => {
        let interpretResponse = this.helperDev.InterpretResponse(result);
        if (interpretResponse.status == false) {
          this.observable.LoadNotificaction({
            option: 'message',
            type: 'm-error',
            message: 'No se pudo actualizar los mensajes del chat ' + this.chat.data.id
          })
          return;
        }
        this.loadChats.emit(true);
      },
      error => this.observable.LoadNotificaction({
        option: 'message',
        type: 'm-error',
        message: '(404) No se pudo actualizar los mensajes del chat ' + this.chat.data.id
      })
    )
  }

  VerifyChat(to: any, toName: string, chatType: string) {
    this.styleModal = 'modal-hide';
    if (chatType == '1') {
      this.Initialize(to, toName, chatType);
      return;
    }
    this.observable.LoadNotificaction({ option: 'loading', sw: true })

    this.chatService.VerifyChat({ to, chatType }).subscribe(
      (result: any) => {
        this.observable.LoadNotificaction({ option: 'loading', sw: false })
        let interpretResponse = this.helperDev.InterpretResponse(result);
        if (interpretResponse.status == false) {
          if (result.status == 702) {
            this.Initialize(to, toName, chatType);
            return;
          }
          this.observable.LoadNotificaction({
            option: 'message',
            type: 'm-error',
            message: 'Error inesperado.'
          })
          return;
        }
        this.GetChat({ id: result.chatID });
      },
      error => this.observable.LoadNotificaction({
        option: 'message',
        type: 'm-error',
        message: '(404) Error inesperado.'
      })
    )
  }

  AddParticipant(userID: any) {
    this.observable.LoadNotificaction({ option: 'loading', sw: true })

    this.chatService.AddParticipant({ userID, chatID: this.chat.data.id }).subscribe(
      (result: any) => {
        let interpretResponse = this.helperDev.InterpretResponse(result);
        if (interpretResponse.status == false) {
          this.observable.LoadNotificaction({
            option: 'message',
            type: 'm-error',
            message: 'No se pudo agregar al nuevo participante'
          })
          return;
        }
        this.observable.LoadNotificaction({ option: 'loading', sw: false })
        this.ShowGroup(0, '');
        this.GetChat({ id: this.chat.data.id });
      }
      ,
      error => this.observable.LoadNotificaction({
        option: 'message',
        type: 'm-error',
        message: '(404) No se pudo agregar al nuevo participante.'
      })
    )
  }

  ToTicket() {
    let body: string = '';
    let customerLogin: string = '';
    this.chat.messages.forEach((element: any) => {
      body += `De: ` + element.fromName + ` <br> Mensage: ` + element.body + ` <br> <small>fecha: ` + element.create_time + `</small> <br><br><br> `;
      if (element.from != this.userID) customerLogin = element.fromName;
    });
    if (customerLogin == '') {
      this.contentModal = '';
      this.styleModal = 'modal-hide';
      this.observable.LoadNotificaction({
        option: 'message',
        type: 'm-error',
        message: 'Este chat aun no se puede convertir en ticket, el cliente no ha dado una respuesta.'
      })
      return;
    }
    this.observable.LoadNotificaction({ option: 'loading', sw: true })

    let data: any = {
      subject: this.chat.data.subject,
      body: body,
      type: '2',
      owner: this.chat.data.ownerID,
      chatID: this.chat.data.id,
      password: this.GetUserOW()
    }
    this.ticketService.Create(data).subscribe(
      (result: any) => {
        this.contentModal = '';
        this.styleModal = 'modal-hide';
        let interpretResponse = this.helperDev.InterpretResponse(result);
        if (interpretResponse.status == false) {
          this.observable.LoadNotificaction({
            option: 'message',
            type: 'm-error',
            message: 'No se pudo crear el ticket.'
          })
          return;
        }
        this.loadChats.emit(true);
        this.observable.LoadNotificaction({ option: 'loading', sw: false })
        this.ClearChat();
      }
      ,
      error => this.observable.LoadNotificaction({
        option: 'message',
        type: 'm-error',
        message: '(404) No se pudo crear el ticket.'
      })
    )
  }

  Reasign() {
    this.observable.LoadNotificaction({ option: 'loading', sw: true })

    this.chatService.Reasign(this.reasignForm.value).subscribe(
      (result: any) => {
        let interpretResponse = this.helperDev.InterpretResponse(result);
        if (interpretResponse.status == false) {
          this.observable.LoadNotificaction({
            option: 'message',
            type: 'm-error',
            message: 'No se pudo asignar el chat ' + this.chat.data.id
          })
          return;
        }
        this.loadChats.emit(true);
        if (this.chat.data.chat_type != 3) this.ClearChat();
        else this.GetChat({ id: this.chat.data.id })
        this.styleModal = 'modal-hide';
        this.observable.LoadNotificaction({ option: 'loading', sw: false })
      },
      error => this.observable.LoadNotificaction({
        option: 'message',
        type: 'm-error',
        message: '(404) No se pudo asignar el chat ' + this.chat.data.id
      })
    )
  }
  //#endregion
  
  PinChat(item: any) {
    this.observable.LoadNotificaction({ option: 'loading', sw: true })

    this.chatService.PinChat({ messageID: item.id, title: this.pintTitle }).subscribe(
      (result: any) => {
        let interpretResponse = this.helperDev.InterpretResponse(result);
        if (interpretResponse.status == false) {
          this.observable.LoadNotificaction({
            option: 'message',
            type: 'm-error',
            message: 'No se pudo fijar el mensaje ' + item.id
          })
          return;
        }
        this.GetPinChat();
        this.GetMessages();
        item['class'] = false;
        this.observable.LoadNotificaction({ option: 'loading', sw: false })
      },
      error => this.observable.LoadNotificaction({
        option: 'message',
        type: 'm-error',
        message: '(404) No se pudo fijar el mensaje ' + item.id
      })
    )
  }

  PinChatUpdate(messageID: any, op: string, newValue: string) {
    this.observable.LoadNotificaction({ option: 'loading', sw: true })

    this.chatService.PinChatUpdate({ messageID }).subscribe(
      (result: any) => {
        let interpretResponse = this.helperDev.InterpretResponse(result);
        if (interpretResponse.status == false) {
          this.observable.LoadNotificaction({
            option: 'message',
            type: 'm-error',
            message: 'No se pudo actualizar el mensaje'
          })
          return;
        }
        this.GetMessages();
        this.GetPinChat();
        this.observable.LoadNotificaction({ option: 'loading', sw: false })
      },
      error => this.observable.LoadNotificaction({
        option: 'message',
        type: 'm-error',
        message: '(404) No se pudo actualizar el mensaje'
      })
    )
  }

  GetPinChat() {
    this.observable.LoadNotificaction({ option: 'loading', sw: true })

    this.chatService.GetPinChat({ chatID: this.chat.data.id }).subscribe(
      (result: any) => {
        let interpretResponse = this.helperDev.InterpretResponse(result);
        if (interpretResponse.status == false) {
          this.observable.LoadNotificaction({
            option: 'message',
            type: 'm-error',
            message: 'No se pudo obtener la lista de mensajes fijados'
          })
          return;
        }
        this.chat.pinned = result.result;
        this.filterPin = result.result;
        this.RenderList();
        this.observable.LoadNotificaction({ option: 'loading', sw: false })
      },
      error => this.observable.LoadNotificaction({
        option: 'message',
        type: 'm-error',
        message: '(404) No se pudo obtener la lista de mensajes fijados'
      })
    )
  }
  //#endregion

  //#region DOM event
  ShowGroup(op: number, option: string) {
    if (op == 0) {
      this.styleGroupAdd = 'group-add-hide'
      this.styleGroup = this.styleGroup == 'group-hide' ? 'group-show' : 'group-hide';
    } else {
      if (option != this.userActive) {
        if (this.userActive == 'cliente')
          this.usrList = this.usersCustomer;
        else this.usrList = this.usersAgents;
        return;
      };
      this.styleGroupAdd = this.styleGroupAdd == 'group-add-hide' ? 'group-add-show' : 'group-add-hide';
    }
  }

  FilterLists() {
    if (this.userActive == 'cliente')
      this.usrList = this.LIKE_list(this.usersCustomer);
    else this.usrList = this.LIKE_list(this.usersAgents);
  }

  FilterListsMessage() {
    this.filterMessage = this.LIKE_listMessage();
  }

  FilterListsPin() {
    this.filterPin = this.LIKE_listPin();
  }

  RenderList() {
    for (let a = 0; a < this.chat.messages.length; a++) {
      let create_time = moment(this.chat.messages[a].create_time).format('l');
      if (create_time == moment().format('l')) this.chat.messages[a].create_time = moment(this.chat.messages[a].create_time).format('LT');
      else this.chat.messages[a].create_time = create_time;
    }

    for (let a = 0; a < this.filterPin.length; a++) {
      let create_time = moment(this.filterPin[a].create_time).format('l');
      if (create_time == moment().format('l')) this.filterPin[a].create_time = moment(this.filterPin[a].create_time).format('LT');
      else this.filterPin[a].create_time = create_time;
    }
    
    for (let a = 0; a < this.chat.scaled.length; a++) {
      let create_time = moment(this.chat.scaled[a].create_time).format('l');
      if (create_time == moment().format('l')) this.chat.scaled[a].create_time = moment(this.chat.scaled[a].create_time).format('LT');
      else this.chat.scaled[a].create_time = create_time;
    }
  }

  async ScrollTop() {
    var objDiv: any = document.getElementById("messages-div");
    if (objDiv) objDiv.scrollTop = await objDiv.scrollHeight + 400;
    this.scroll =  objDiv?.scrollTop;
  }
  //#endregion

  //#region Events
  OnFile(event: HTMLInputEvent | any) {
    if (!event.target.files && !event.target.files[0])
      return;
    this.styleAttached = true;
    this.attached = event.target.files[0];
    this.typeFile = this.attached?.type.split('/')[0];
    this.fileName = this.attached?.name;

  }

  MessageEvent() {
    if (this.event) this.CreateChat()
    else this.SendMessage();
  }

  Initialize(toID: string, toName: string, chatType: string) {
    this.ClearChat();

    this.chatForm.get('to')?.setValue(toID);
    this.chatForm.get('chatType')?.setValue(chatType);

    if (chatType == '2') {
      this.styleModal = 'modal-hide';
      this.chatForm.get('subject')?.setValue('agentes');
      this.chat.data.chat_type = 2;
    }
    else {
      this.chat.data.chat_type = 1;
      this.contentModal = 'Asunto del chat';
      this.styleModal = 'modal-show';
      this.chatForm.get('subject')?.setValue('');
    }

    this.chat.data.id = -1;
    this.chat.data.owner = toName;
    this.event = true;
  }
  //#endregion

  //#region Tools
  LIKE_list(list: any) {
    if (list.length == 0) return [];
    let indication: string = this.indicationUser.toLowerCase();
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

  LIKE_listMessage() {
    if (this.chat.messages.length == 0) return [];
    let indication: string = this.indicationMessage.toLowerCase();
    if (this.indicationMessage == '') return [];
    let list_aux: any = [];
    this.chat.messages.forEach((element: any) => {
      let body: string = element.body == null ? '' : element.body;
      body = body.toLowerCase();

      let fromName: string = element.fromName == null ? '' : element.fromName;
      fromName = fromName.toLowerCase();

      if (body.indexOf(indication) !== -1 || fromName.indexOf(indication) !== -1) {
        list_aux.push(element);
      }
    });
    return list_aux;
  }

  LIKE_listPin() {
    if (this.chat.pinned.length == 0) return [];
    let indication: string = this.indicationPin.toLowerCase();
    let list_aux: any = [];
    this.chat.pinned.forEach((element: any) => {
      let body: string = element.body == null ? '' : element.body;
      body = body.toLowerCase();

      let fromName: string = element.fromName == null ? '' : element.fromName;
      fromName = fromName.toLowerCase();

      let userName: string = element.userName == null ? '' : element.userName;
      userName = userName.toLowerCase();

      let title: string = element.title == null ? '' : element.title;
      title = title.toLowerCase();

      if (body.indexOf(indication) !== -1 ||
        fromName.indexOf(indication) !== -1 ||
        userName.indexOf(indication) !== -1 ||
        title.indexOf(indication) !== -1) {
        list_aux.push(element);
      }
    });
    return list_aux;
  }

  ClearFile() {
    this.styleAttached = false;
    this.iputFile.nativeElement.value = '';
    this.attached = null;
    this.fileName = '';
  }

  ClearChat() {
    this.chat = {
      data: {
        id: 0,
        owner: '',
        agent: null,
        agentID: 1,
        subject: '',
        state: 0,
        chat_type: 0,
        create_time: '',
        change_time: '',
        ticketID: null,
        closed_time: '',
        archived: 0,
        delete: 0
      },
      messages: [],
      pinned: [],
      participants: [],
      scaled: []
    }
    this.styleModal = 'modal-hide';
    this.styleSection = false;
  }

  GetUserOW() {
    let user: any = localStorage.getItem(btoa('auth'));
    if (!user) return;
    user = JSON.parse(atob(user));
    return user.ow;
  }
  //#endregion
}