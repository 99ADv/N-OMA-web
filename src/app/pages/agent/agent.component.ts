//#region Angular
import { Component, OnInit } from '@angular/core';
//#endregion

//#region Services
import { HelperdevService } from 'src/app/core/services/tools/helperdev/helperdev.service';
import { ObservableService } from 'src/app/core/services/tools/observable/observable.service';
import { UserService } from 'src/app/core/services/api/user/user.service';
//#endregion

//#region Others
import { Socket } from 'ngx-socket-io';
import * as moment from 'moment';
import { FormControl, FormGroup, Validators } from '@angular/forms';
//#endregion

@Component({
  selector: 'app-agent',
  templateUrl: './agent.component.html',
  styleUrls: ['./agent.component.scss']
})

export class AgentComponent implements OnInit {
  //#region Variables

  //#region DOM
  //#endregion

  //#endregion

  //#region Object
  item_: any = {
    id: 0,
    full_name: '',
    access: []
  }
  //#endregion

  //#region List
  agents: any[] = []
  access: any[] = []
  //#endregion

  //#region Index
  constructor(
    private observable: ObservableService,
    private helperDev: HelperdevService,
    private userService: UserService,
    private socket: Socket) { }
  //#endregion

  //#region Live cycle
  ngOnInit(): void {
    this.observable.LoadHeaderStyle({ style: 0, page: 4 });
    this.GetUsers(true);
  }
  //#endregion

  //#region API
  GetUsers(typeList: boolean) {
    this.observable.LoadNotificaction({ option: 'loading', sw: true })

    this.userService.GetUsersAccess({op: '1'}).subscribe(
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
        if(typeList) this.access = result.results.access;
      }
      , error => this.observable.LoadNotificaction({
        option: 'message',
        type: 'm-error',
        message: '(404) No se pudo cargar la lista de agentes',
      })
    );
  }

  Update(accessID: string, op: string) {
    this.observable.LoadNotificaction({ option: 'loading', sw: true })

    this.userService.UpdateAccess({userID: this.item_.id, accessID, op}).subscribe(
      (result: any) => {
        let interpretResponse = this.helperDev.InterpretResponse(result);
        if (interpretResponse.status == false) {
          this.observable.LoadNotificaction({
            option: 'message',
            type: 'm-error',
            message: 'Error interno',
          })
          return;
        }
        this.observable.LoadNotificaction({ option: 'loading', sw: false })
        this.GetUsers(false);
      }
      , error => this.observable.LoadNotificaction({
        option: 'message',
        type: 'm-error',
        message: '(404) Error interno',
      })
    );
  }
  //#endregion

  //#region Event
  Asing(item: any) {
    if(item.active) this.Update(item.id, '0')
    else this.Update(item.id, '1')
    item.active = !item.active;
  }
  //#endregion

  //#region Tools
  ClearForm() {
    this.item_ = {
      id: 0,
      full_name: '',
      access: []
    }
  }

  AssignAccess() {
    this.access.forEach((element: any) => {
      element.active = false;
      this.item_.access.forEach((element1: any) => {
        if (element1.id == element.id) element.active = true;
      });
    });
  }
  //#endregion
}