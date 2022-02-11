//#region Angular
import { Component, OnInit } from '@angular/core';
//#endregion

//#region Services
import { ObservableService } from 'src/app/core/services/tools/observable/observable.service';
//#endregion

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit {

  //#region Index
  constructor(
    private observable: ObservableService) { }
  //#endregion

  //#region Live cycle
  ngOnInit(): void {
    this.observable.LoadHeaderStyle({ style: 0, page: 0 });
  }
  //#endregion
}
