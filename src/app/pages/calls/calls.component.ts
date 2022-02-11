//#region Angular
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
//#endregion

//#region Service
import { ObservableService } from 'src/app/core/services/tools/observable/observable.service';
import { TelService } from 'src/app/core/services/api/tel/tel.service';
import { HelperdevService } from 'src/app/core/services/tools/helperdev/helperdev.service';
//#endregion

//#region Others
import { Socket } from 'ngx-socket-io';
import * as moment from 'moment';
//#endregion

@Component({
  selector: 'app-calls',
  templateUrl: './calls.component.html',
  styleUrls: ['./calls.component.scss']
})

export class CallsComponent implements OnInit {

  //#region Variables
  option: string = 'entrantes';
  telActive: number = 0;
  amout: number = 6;
  itemDelete: any = '';
  interval: number = 60;
  list_active: any = 0;

  //#region DOM
  styleModal: string = '';
  //#endregion

  //#endregion

  //#region Object
  ticketForm = new FormGroup({
    callLogID: new FormControl('', [Validators.required]),
    customerID: new FormControl('', [Validators.required]),
    queueID: new FormControl('', [Validators.required]),
    subject: new FormControl('', [Validators.required]),
    body: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });
  rejectCallForm = new FormGroup({
    reason: new FormControl('', [Validators.required]),
    callLogID: new FormControl('', [Validators.required]),
  });
  item_: any = {
    id: 0,
    telID: 1,
    tel_name: 'Soporte',
    customerID: 14,
    customer_name: 'Antonio marin',
    queueID: null,
    queue_name: null,
    agentID: null,
    agent_name: null,
    subject: '',
    state: 0,
    ticketID: null,
    delete: 0,
    create_time: '2022/02/07 08:06:22'
  }
  user: any = {};
  //#endregion

  //#region List
  tels: any[] = []
  calls_: any = {}
  calls: any = []
  incomig: any = []
  lost: any = []
  queues: any = [];
  //#endregion

  //#region Index
  constructor(
    private telService: TelService,
    private helperDev: HelperdevService,
    private observable: ObservableService,
    private socket: Socket) { }
  //#endregion

  //#region Live cylce
  ngOnInit(): void {
    this.observable.LoadHeaderStyle({ style: 0, page: 2 });
    let user = this.helperDev.GetUserData();
    this.ticketForm.get('password')?.setValue(user.ow)

    this.socket.fromEvent('call_log').subscribe(
      (result: any) => {
        this.tels.forEach(element => {
          if (element.id == result.telID) {
            this.GetCalls();
            this.helperDev.AudioPlay('../../../../assets/audio/call.mp3');
          }
        });
      }
    )

    this.socket.fromEvent('tel').subscribe(
      (result: any) => {
        this.tels.forEach(element => {
          this.GetTels();
        });
      }
    )
    this.GetTels();
  }
  //#endregion

  //#region API
  GetTels() {
    this.observable.LoadNotificaction({ option: 'loading', sw: true })
    this.telService.GetTels().subscribe(
      (result: any) => {
        let interpretResponse = this.helperDev.InterpretResponse(result);
        if (interpretResponse.status == false) {
          this.observable.LoadNotificaction({
            option: 'message',
            type: 'm-error',
            message: 'No se pudo obtener la lista de telefonos.'
          })
          return;
        }
        this.observable.LoadNotificaction({ option: 'loading', sw: false })
        this.tels = result.result;
        this.GetCalls();
      },
      error => this.observable.LoadNotificaction({
        option: 'message',
        type: 'm-error',
        message: '(404) No se pudo obtener la lista de telefonos.'
      })
    )
  }

  GetCalls() {
    let op: string = '';
    switch (this.option) {
      case 'entrantes':
        op = '0';
        break;
      case 'borradores':
        op = '1';
        break;
      case 'atendidas':
        op = '2';
        break;
      case 'rechazadas':
        op = '3';
        break;
    }
    this.observable.LoadNotificaction({ option: 'loading', sw: true })
    this.telService.GetCall({ op }).subscribe(
      (result: any) => {
        let interpretResponse = this.helperDev.InterpretResponse(result);
        if (interpretResponse.status == false) {
          this.observable.LoadNotificaction({
            option: 'message',
            type: 'm-error',
            message: 'No se pudo obtener la lista de llamadas.'
          })
          return;
        }
        this.observable.LoadNotificaction({ option: 'loading', sw: false })
        this.calls_ = result.result;
        if (op != '0') {
          this.list_active = 0;
          this.telActive = 0;
          this.incomig = [];
          
          this.tels.forEach(element => {
            this.calls_[element.id].forEach((element1: any) => {
              this.incomig.push(element1);
            });
          });
        } else {
          this.incomig = [];
          this.ShowCall()
        }
      },
      error => this.observable.LoadNotificaction({
        option: 'message',
        type: 'm-error',
        message: '(404) No se pudo obtener la lista de llamadas.'
      })
    )
  }

  callUpdate(item: any, op: any, newValue: any) {
    this.telService.UpdateCallLog({ id: item.id, op, newValue }).subscribe(
      (result: any) => {
        let interpretResponse = this.helperDev.InterpretResponse(result);
        if (interpretResponse.status == false) {
          this.observable.LoadNotificaction({
            option: 'message',
            type: 'm-error',
            message: 'No se pudo asignar la llamada'
          })
          return;
        }
        if (op == '1') this.TakeCall(item);
      },
      error => this.observable.LoadNotificaction({
        option: 'message',
        type: 'm-error',
        message: '(404) No se pudo asignar la llamada.'
      })
    )
  }

  callReject() {
    this.telService.DeleteRecord(this.rejectCallForm.value).subscribe(
      (result: any) => {
        let interpretResponse = this.helperDev.InterpretResponse(result);
        if (interpretResponse.status == false) {
          this.observable.LoadNotificaction({
            option: 'message',
            type: 'm-error',
            message: 'No se pudo rechazar la llamada'
          })
          return;
        }
        this.GetCalls();
        this.styleModal = '';
        this.rejectCallForm.get('body')?.setValue('');
      },
      error => this.observable.LoadNotificaction({
        option: 'message',
        type: 'm-error',
        message: '(404) No se pudo rechazar la llamada.'
      })
    )
  }

  CreateTicket() {
    this.telService.Create(this.ticketForm.value).subscribe(
      (result: any) => {
        let interpretResponse = this.helperDev.InterpretResponse(result);
        if (interpretResponse.status == false) {
          this.observable.LoadNotificaction({
            option: 'message',
            type: 'm-error',
            message: 'No se pudo crear el reporte de llamada.'
          })
          return;
        }
        this.ClearForm();
        this.GetCalls();
      },
      error => this.observable.LoadNotificaction({
        option: 'message',
        type: 'm-error',
        message: '(404) No se pudo crear el reporte de llamada.'
      })
    )
  }

  Delete() {
    this.telService.Delete({id: this.itemDelete}).subscribe(
      (result: any) => {
        let interpretResponse = this.helperDev.InterpretResponse(result);
        if (interpretResponse.status == false) {
          this.observable.LoadNotificaction({
            option: 'message',
            type: 'm-error',
            message: 'No se pudo borrar la llamada.'
          })
          return;
        }
        this.styleModal = '';
        this.GetCalls();
      },
      error => this.observable.LoadNotificaction({
        option: 'message',
        type: 'm-error',
        message: '(404) No se pudo borrar la llamada.'
      })
    )
  }
  //#endregion

  //#region DOM
  //#endregion

  //#region DOM event
  ShowCall() {
    if (this.list_active == 0) {
      this.telActive = 0;
      this.calls = [];
      this.tels.forEach(element => {
        this.calls_[element.id].forEach((element1: any) => {
          if (this.DifferenceINSecinds(element1.create_time) < this.interval) this.calls.push(element1);
        });
      });
      this.RenderList();
      return;
    }
    if(this.calls_[this.list_active.id].length == 0) {
      this.incomig = [];
      this.lost = [];
    }
    this.calls = this.calls_[this.list_active.id]
    this.telActive = this.list_active.id
    this.queues = this.list_active.queues;
    if (this.queues && this.queues.length == 1)
      this.ticketForm.get('queueID')?.setValue(this.queues[0]['queueID'].toString());
    setInterval(() => {
      if (this.calls.length != 0) this.Classify();
    }, 1000)
    this.RenderList();
  }

  TakeCall(item: any) {
    this.SearchQueue(item.id);
    this.ticketForm.get('customerID')?.setValue(item.customerID);
    this.ticketForm.get('callLogID')?.setValue(item.id);
    this.item_ = item;
  }

  RejectActive(item: any) {
    this.rejectCallForm.get('callLogID')?.setValue(item.id);
    this.styleModal = 'reject';
    this.rejectCallForm.get('reason')?.setValue('No tuvo conversación');
  }

  RenderList() {
    for (let a = 0; a < this.calls.length; a++) {
      let create_time = moment(this.calls[a].create_time).format('l');
      if (create_time == moment().format('l')) this.calls[a].create_time1 = moment(this.calls[a].create_time).format('LT');
      else this.calls[a].create_time1 = create_time;
    }
  }
  //#endregion

  //#region Tools
  Classify() {
    this.lost = [];
    this.incomig = [];
    this.calls.forEach((element: any) => {
      if (this.DifferenceINSecinds(element.create_time) > this.interval)
        this.lost.push(element);
      else this.incomig.push(element);
    });
  }

  GetUserData() {
    this.user = localStorage.getItem(btoa('auth'));
    if (!this.user) this.user = {};
    this.user = JSON.parse(atob(this.user));
  }

  ClearForm() {
    this.item_ = {
      id: 0,
      telID: 1,
      tel_name: 'Soporte',
      customerID: 14,
      customer_name: 'Antonio marin',
      queueID: null,
      queue_name: null,
      agentID: null,
      agent_name: null,
      subject: '',
      state: 0,
      ticketID: null,
      delete: 0,
      create_time: '2022/02/07 08:06:22'
    }
    this.ticketForm.get('customerID')?.setValue('');
    this.ticketForm.get('subject')?.setValue('');
    this.ticketForm.get('body')?.setValue('');
  }

  DifferenceINSecinds(date: any = '') {
    var now = moment(new Date());
    var end = moment(date);
    var duration = moment.duration(now.diff(end));
    return parseInt(duration.asSeconds().toString());
  }

  SearchQueue(callID: any) {
    this.tels.forEach(element => {
      this.calls_[element.id].forEach((element1: any) => {
        if (callID == element1.id) {
          this.queues = element.queues
        }
      });
    });
  }
  //#endregion
}