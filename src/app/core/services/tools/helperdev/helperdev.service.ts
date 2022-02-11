//#region Angular
import { Injectable } from '@angular/core';
//#endregion

//#region Service
import { UserService } from '../../api/user/user.service';
//#endregion

@Injectable({
  providedIn: 'root'
})

export class HelperdevService {
  //#region Index
  constructor(
    private userService: UserService
  ) { }
  //#endregion

  //#region Tools methods
  InterpretResponse(result: any) {
    let response: any = {
      message: '',
      status: false
    }
    switch (result.status) {
      case 700:
        response.message = 'succes';
        response.status = true;
        break;
      case 701:
        response.message = '(r701) Error inesperado.';
        break;
      case 702:
        if(result.message == 'This user already has a session created')
          response.message = 'Usted ya tiene una sesión activa.';
        else response.message = 'Credenciales incorrectas.';
        break;
      case 801:
        response.message = '(r801) Error inesperado.';
        break;
    }
    return response;
  }
  
  AudioPlay(path: string) {
    const audio = new Audio(path)
    audio.play();
  }

  GetUserData() {
    let user: any = localStorage.getItem(btoa('auth'));
    if (!user) return;
    user = JSON.parse(atob(user));
    return user;
  }

  VerifyAccess(id: any) {
    let sw = false;
    this.userService.access.forEach(element => {
      if(id == element.id) sw = true;
    });
    return sw;
  }
  //#endregion
}