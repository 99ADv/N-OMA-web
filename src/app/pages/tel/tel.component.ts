//#region Angular
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
//#endregion

//#region Services
import { HelperdevService } from 'src/app/core/services/tools/helperdev/helperdev.service';
import { ObservableService } from 'src/app/core/services/tools/observable/observable.service';
import { UserService } from 'src/app/core/services/api/user/user.service';
import { TicketService } from 'src/app/core/services/api/ticket.service';
import { TelService } from 'src/app/core/services/api/tel/tel.service';
//#endregion

//#region Others
import { Socket } from 'ngx-socket-io';
//#endregion

@Component({
  selector: 'app-tel',
  templateUrl: './tel.component.html',
  styleUrls: ['./tel.component.scss']
})

export class TelComponent implements OnInit {

  //#region Variables
  typeForm: string = '';

  //#region DOM
  //#endregion

  //#endregion

  //#region List
  typeModal: string = ''
  queues: any[] = [];
  agents: any[] = [];
  queusAS: any[] = [];
  agentsAS: any[] = [];
  //#endregion

  //#region Object
  telForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    number: new FormControl('', [Validators.required]),
    state: new FormControl('0', [Validators.required]),
    queues: new FormControl([]),
    agents: new FormControl([]),
  });
  item: any = {
    id: 1,
    name: 'Soporte',
    number: '3205342112',
    state: 1,
    create_time: '2022/02/02',
    agents: [
      {
        id: 1,
        name: 'Jairo'
      },
      {
        id: 2,
        name: 'Andres'
      },
      {
        id: 3,
        name: 'Cindy'
      },
    ],
    queues: [
      {
        id: 1,
        name: 'Soporte'
      },
      {
        id: 1,
        name: 'Desarrollo'
      }
    ]
  }
  //#endregion

  //#region List
  tells: any[] = []
  //#endregion

  //#region Index
  constructor(
    private observable: ObservableService,
    private helperDev: HelperdevService,
    private userService: UserService,
    private ticketService: TicketService,
    private telService: TelService,
    private socket: Socket) { }
  //#endregion

  //#region Live cycle
  ngOnInit(): void {
    this.observable.LoadHeaderStyle({ style: 0, page: 4 });

    this.GetUsers();
    this.GetQueues();
    this.GetTells();
  }
  //#endregion

  //#region API
  Create() {
    this.observable.LoadNotificaction({ option: 'loading', sw: true })
    this.telForm.get('queues')?.setValue(this.queusAS);
    this.telForm.get('agents')?.setValue(this.agentsAS);
    this.telService.CreateTel(this.telForm.value).subscribe(
      (result: any) => {
        let interpretResponse = this.helperDev.InterpretResponse(result);
        if (interpretResponse.status == false) {
          this.observable.LoadNotificaction({
            option: 'message',
            type: 'm-error',
            message: 'No se pudo crear el telefono',
          })
          return;
        }
        this.observable.LoadNotificaction({ option: 'loading', sw: false })
        this.GetTells();
        this.ClearForm();
      }
      , error => this.observable.LoadNotificaction({
        option: 'message',
        type: 'm-error',
        message: '(404) No se pudo crear el telefono',
      })
    );
  }

  GetTells() {
    this.observable.LoadNotificaction({ option: 'loading', sw: true })

    this.telService.Get().subscribe(
      (result: any) => {
        let interpretResponse = this.helperDev.InterpretResponse(result);
        if (interpretResponse.status == false) {
          this.observable.LoadNotificaction({
            option: 'message',
            type: 'm-error',
            message: 'No se pudo cargar la lista de telefonos',
          })
          return;
        }
        this.observable.LoadNotificaction({ option: 'loading', sw: false })
        this.tells = result.results;
      }
      , error => this.observable.LoadNotificaction({
        option: 'message',
        type: 'm-error',
        message: '(404) No se pudo cargar la lista de telefonos',
      })
    );
  }

  GetQueues() {
    this.observable.LoadNotificaction({ option: 'loading', sw: true })

    this.ticketService.GetQueue().subscribe(
      (result: any) => {
        let interpretResponse = this.helperDev.InterpretResponse(result);
        if (interpretResponse.status == false) {
          this.observable.LoadNotificaction({
            option: 'message',
            type: 'm-error',
            message: 'No se pudo cargar la lista de colas',
          })
          return;
        }
        this.observable.LoadNotificaction({ option: 'loading', sw: false })
        this.queues = result.queues;
      }
      , error => this.observable.LoadNotificaction({
        option: 'message',
        type: 'm-error',
        message: '(404) No se pudo cargar la lista de colas',
      })
    );
  }

  GetUsers() {
    this.observable.LoadNotificaction({ option: 'loading', sw: true })

    this.userService.GetUsersAccess({ op: '1' }).subscribe(
      (result: any) => {
        let interpretResponse = this.helperDev.InterpretResponse(result);
        if (interpretResponse.status == false) {
          this.observable.LoadNotificaction({
            option: 'message',
            type: 'm-error',
            message: 'No se pudo cargar la lista de agentes',
          })
          return;
        }
        this.observable.LoadNotificaction({ option: 'loading', sw: false })
        this.agents = result.results.agents;
      }
      , error => this.observable.LoadNotificaction({
        option: 'message',
        type: 'm-error',
        message: '(404) No se pudo cargar la lista de agentes',
      })
    );
  }

  Update(id: any, op: string, value: any) {
    this.observable.LoadNotificaction({ option: 'loading', sw: true })

    this.telService.Update({id, op, value}).subscribe(
      (result: any) => {
        let interpretResponse = this.helperDev.InterpretResponse(result);
        if (interpretResponse.status == false) {
          this.observable.LoadNotificaction({
            option: 'message',
            type: 'm-error',
            message: 'No se pudo actualizar el telefono',
          })
          return;
        }
        switch (op) {
          case '0':
            this.item.name = value;
            break;
          case '1':
            this.item.number = value;
            break;
          case '2':
            this.item.state = value;
            break;
        }
        this.observable.LoadNotificaction({ option: 'loading', sw: false })
        this.GetTells();
      }
      , error => this.observable.LoadNotificaction({
        option: 'message',
        type: 'm-error',
        message: '(404) No se pudo actualizar el telefono',
      })
    );
  }
  //#endregion

  //#region Event
  InitialiceItem(item: any) {
    this.typeForm = 'Modificar';
    this.item = item;
    this.telForm.get('name')?.setValue(item.name);
    this.telForm.get('number')?.setValue(item.number);
    this.telForm.get('state')?.setValue(item.state.toString());
    this.telForm.get('queues')?.setValue(item.queues);
    this.telForm.get('agents')?.setValue(item.agents);

    this.agentsAS = item.agents;
    this.queusAS = item.queues;
    this.AssignUser();
  }

  UpdateEvent() {
    if (this.telForm.get('name')?.value != this.item.name)
      this.Update(this.item.id, '0', this.telForm.get('name')?.value);

    if (this.telForm.get('number')?.value != this.item.number)
      this.Update(this.item.id, '1', this.telForm.get('number')?.value);

    if (this.telForm.get('state')?.value != this.item.state)
      this.Update(this.item.id, '2', this.telForm.get('state')?.value);
  }
  //#endregion

  //#region Tools
  ClearForm() {
    this.telForm.get('name')?.setValue('');
    this.telForm.get('number')?.setValue('');
    this.telForm.get('state')?.setValue('0');
    this.telForm.get('queues')?.setValue([]);
    this.telForm.get('agents')?.setValue([]);
    this.agentsAS = [];
    this.queusAS = [];
  }

  AddList(item: any, list: any[], list_push: number, event: boolean) {
    if (event) {
      list.forEach((element) => {
        if (element.id == item.id) {
          return;
        }
      });
      if (list_push == 1) {
        this.queusAS.push(item);
        
        if(this.typeForm == 'Modificar') this.Update(this.item.id, '4', {id: item.id, name: item.queue_name})
      }
      else {
        this.agentsAS.push(item);
        if(this.typeForm == 'Modificar') this.Update(this.item.id, '6', item.id)
      }
      item.active = true;
    } else {
      let list_aux: any[] = [];
      list.forEach((element: any) => {
        if (element.id != item.id) {
          list_aux.push(element)
        }
      });
      if (list_push == 1) {
        this.queusAS = list_aux;
        if(this.typeForm == 'Modificar') this.Update(this.item.id, '3', item.queueID)
      }
      else {
        this.agentsAS = list_aux;
        if(this.typeForm == 'Modificar') this.Update(this.item.id, '5', item.userID)
      }
      item.active = false;
    }
  }

  AssignUser() {
    this.queusAS.forEach((element: any) => {
      this.queues.forEach((element1: any) => {
        if (element1.id == element.id) element1.active = true;
      });
    });

    this.agentsAS.forEach((element: any) => {
      this.agents.forEach((element1: any) => {
        if (element1.id == element.id) element1.active = true;
      });
    });
  }
  //#endregion
}
