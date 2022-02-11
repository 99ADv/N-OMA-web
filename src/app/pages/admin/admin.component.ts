//#region Angular
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
//#endregion

//#region Services
import { HelperdevService } from 'src/app/core/services/tools/helperdev/helperdev.service';
import { ObservableService } from 'src/app/core/services/tools/observable/observable.service';
//#endregion

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})

export class AdminComponent implements OnInit {

  //#region Index
  constructor(
    private observable: ObservableService,
    private helperDev: HelperdevService,
    private router: Router) { }
  //#endregion

  //#region Live cycle
  ngOnInit(): void {
    // if(!this.helperDev.VerifyAccess(4)) {
    //   this.router.navigate(['/403']);
    //   return
    // } else 
      this.observable.LoadHeaderStyle({ style: 0, page: 4 });
  }
  //#endregion

}