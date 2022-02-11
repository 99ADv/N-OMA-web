//#region Angular
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
//#endregion

//#region Services
import { UserService } from 'src/app/core/services/api/user/user.service';
import { HelperdevService } from 'src/app/core/services/tools/helperdev/helperdev.service';
import { REFERENCE_PREFIX } from '@angular/compiler/src/render3/view/util';
import { ObservableService } from 'src/app/core/services/tools/observable/observable.service';
//#endregion

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent implements OnInit {

  //#region Variables

  //#region DOM
  styleLoadinMessage: string = 'login-message-hide';
  message: string = '';
  styleBtnLoading: string = 'btn-no-loading';
  galleryItem: string = 'show-item-1';
  //#endregion

  //#endregion

  //#region Objects
  loginForm = new FormGroup({
    userLogin: new FormControl('AndresB', [Validators.required]),
    password: new FormControl('123', [Validators.required]),
    fromPage: new FormControl('0', [Validators.required])
  })
  //#endregion

  //#region Index
  constructor(
    private router: Router,
    private userService: UserService,
    private helperDev: HelperdevService,
    private observable: ObservableService
  ) { }
  //#endregion

  //#region Live cylce
  ngOnInit(): void {
    this.Gallery();
    this.observable.LoadHeaderStyle({ style: 2, page: 0 });
  }
  //#endregion

  //#region API
  Verify() {
    this.Notification(false, '');
    this.styleBtnLoading = 'btn-login-loading';
    this.userService.LogIn(this.loginForm.value).subscribe(
      (result: any) => {
        this.styleBtnLoading = 'btn-no-loading';
        let interpretResponse = this.helperDev.InterpretResponse(result);
        if (!interpretResponse.status) {
          this.Notification(true, interpretResponse.message);
          return;
        }
        if (result.token == '') {
          this.Notification(true, 'No se pudo iniciar la sessión.');
          return;
        }
        let user = JSON.stringify(result);
        localStorage.setItem(btoa('auth'), btoa(user));
        document.cookie = "OTRSAgentInterface="+result.sessionID;
        this.router.navigate(['/home']);
      }
      ,
      error => {
        this.Notification(true, 'Error inesperado');
        this.styleBtnLoading = 'btn-no-loading';
      }
    )
  }
  //#endregion

  //#region DOM
  Gallery() {
    let ct = 1;
    setInterval(() => {
      ct += 1;
      this.galleryItem = 'show-item-' + ct;
      if (ct == 4) ct = 0;
    }, 6000);
  }

  Notification(sw: boolean, messgae: string) {
    if (sw) {
      this.styleLoadinMessage = 'login-message-show';
      this.message = messgae;
      setTimeout(() => {
        this.Notification(false, '');
      }, 6000);
    } else {
      this.styleLoadinMessage = 'login-message-hide';
      this.message = '';
    }
  }
  //#endregion
}