//#region Angular
import { Component, OnInit } from '@angular/core';
//#endregion

//#region Service
import { UserService } from 'src/app/core/services/api/user/user.service';
import { HelperdevService } from 'src/app/core/services/tools/helperdev/helperdev.service';
import { ObservableService } from 'src/app/core/services/tools/observable/observable.service';
//#endregion

@Component({
  selector: 'app-page403',
  templateUrl: './page403.component.html',
  styleUrls: ['./page403.component.scss']
})

export class Page403Component implements OnInit {

  //#region List
  access: any[] = [];
  //#endregion

  //#region Index
  constructor(
    private observable: ObservableService,
    private userService: UserService,
    private helperDev: HelperdevService
  ) { }
  //#endregion

  //#region Live cycle
  ngOnInit(): void {
    this.observable.LoadHeaderStyle({ style: 2, page: 0 });
    this.GetAccess();
  }
  //#endregion

  //#region API
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
        this.access = result.results
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

}
